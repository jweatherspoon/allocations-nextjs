'use client';

import { useState } from 'react';

import { updateFund } from '@/api/funds/funds.api';
import type { PanelProps } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useToast } from '@/components/shell/toast-context';
import { PanelHeader } from '@/components/ui/panel-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { formatDayUpper, money, MONTH_MS } from '@/lib/pace/format';
import { parseTargetDate } from '@/lib/pace/pace';
import type { UpdateFundInput } from '@/models/funds/actions.model';

const MAX_MONTHS_AHEAD = 120;
const NEW_DEADLINE_MONTHS = 12;

const pad = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` of a UTC timestamp. */
function isoDay(t: number): string {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Moves a `YYYY-MM-DD` date by whole months, clamping the day to the month's length. */
function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-${pad(Math.min(d, lastDay))}`;
}

/** "Nov 23, 2027" (UTC), for use inside sentences. */
function formatDay(t: number): string {
  return new Date(t).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Months since year 0, for comparing calendar months. */
function monthIndex(iso: string): number {
  const [y, m] = iso.slice(0, 10).split('-').map(Number);
  return y * 12 + (m - 1);
}

/** Edits a fund's name, description, target and deadline, with Undo. */
export function EditFundPanel({ request, onClose }: PanelProps<'edit'>) {
  const portfolio = usePortfolio();
  const { mask } = usePreferences();
  const toast = useToast();

  const view = [...portfolio.active, ...portfolio.archived].find(
    (f) => f.id === request.fundId,
  );
  const fund = view?.fund;

  const [name, setName] = useState(fund?.name ?? '');
  const [description, setDescription] = useState(fund?.description ?? '');
  const [target, setTarget] = useState(
    fund?.targetAmount ? String(fund.targetAmount) : '',
  );
  // The deadline is `base` moved by `offset` months, so stepping through short
  // months (e.g. Jan 31 → Feb 28 → Mar) doesn't lose the original day.
  const [base, setBase] = useState(
    fund?.targetDate ? fund.targetDate.slice(0, 10) : null,
  );
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);

  if (!view || !fund) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <PanelHeader title='Edit fund' onClose={onClose} />
        <p className='mt-8 text-sm text-muted'>This fund no longer exists.</p>
      </div>
    );
  }

  const deadline = base ? addMonths(base, offset) : null;
  const hasDeadline = deadline !== null;
  const nowMonth = monthIndex(isoDay(portfolio.now));
  const canEarlier =
    deadline !== null && monthIndex(addMonths(deadline, -1)) >= nowMonth;
  const canLater =
    deadline !== null &&
    monthIndex(addMonths(deadline, 1)) <= nowMonth + MAX_MONTHS_AHEAD;

  const targetValue = parseFloat(target);
  const hasTarget = target.trim() !== '' && targetValue > 0;
  const targetInvalid = target.trim() !== '' && !(targetValue > 0);
  const needsTarget = hasDeadline && !hasTarget;

  const next: UpdateFundInput = {
    name: name.trim(),
    description: description.trim(),
    targetAmount: hasTarget ? Math.round(targetValue * 100) / 100 : null,
    // Keep the stored value untouched (it may be a full ISO string) unless it changed.
    targetDate:
      deadline === null
        ? null
        : fund.targetDate && deadline === fund.targetDate.slice(0, 10)
          ? fund.targetDate
          : deadline,
  };
  const dirty =
    next.name !== fund.name ||
    next.description !== (fund.description ?? '') ||
    next.targetAmount !== (fund.targetAmount ?? null) ||
    next.targetDate !== (fund.targetDate ?? null);
  const valid = next.name.length >= 1 && !targetInvalid && !needsTarget;
  const canSave = valid && dirty && !busy;

  const isGoal = hasTarget && hasDeadline;
  let preview: { headline: string; detail: string } | null = null;
  if (isGoal && deadline) {
    const left = Math.max(0, next.targetAmount! - view.balance);
    const months = (parseTargetDate(deadline) - portfolio.now) / MONTH_MS;
    preview =
      left === 0
        ? {
            headline: 'Funded',
            detail: 'You already have enough saved for this target.',
          }
        : {
            headline: `${mask(money(left / Math.max(months, 0.5)))}/mo`,
            detail: `To save the remaining ${mask(money(left))} by ${formatDay(parseTargetDate(deadline))}.`,
          };
  } else if (hasTarget) {
    preview = {
      headline: 'Pot with a target',
      detail:
        'No deadline, so there is no monthly pace. Add one to turn this into a goal.',
    };
  }

  function addDeadline() {
    setBase(addMonths(isoDay(portfolio.now), NEW_DEADLINE_MONTHS));
    setOffset(0);
  }

  function removeDeadline() {
    setBase(null);
    setOffset(0);
  }

  async function save() {
    if (!canSave) return;
    setBusy(true);
    try {
      const res = await updateFund(fund!.id, next);
      if (!res.ok || !res.previous) {
        toast.show("Couldn't save changes");
        setBusy(false);
        return;
      }
      const previous = res.previous;
      onClose();
      toast.show(`Updated ${next.name}`, async () => {
        await updateFund(fund!.id, previous);
      });
    } catch {
      toast.show("Couldn't save changes");
      setBusy(false);
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader title='Edit fund' onClose={onClose} />
      <div className='mt-6 min-h-0 flex-1 overflow-y-auto'>
        <label htmlFor='ef-name' className='text-xs font-medium text-muted'>
          Name
        </label>
        <input
          id='ef-name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete='off'
          className='mb-5 h-12 w-full border-b border-line bg-transparent text-2xl font-semibold outline-none focus:border-accent'
        />

        <label htmlFor='ef-desc' className='text-xs font-medium text-muted'>
          Description
        </label>
        <input
          id='ef-desc'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
          placeholder='Optional'
          autoComplete='off'
          className='mb-5 h-11 w-full border-b border-line bg-transparent text-base outline-none placeholder:text-muted/60 focus:border-accent'
        />

        <div className='flex items-baseline justify-between'>
          <label htmlFor='ef-target' className='text-xs font-medium text-muted'>
            Target amount
          </label>
          {target !== '' && (
            <button
              type='button'
              onClick={() => setTarget('')}
              className='text-xs font-semibold text-accent'
            >
              Remove target
            </button>
          )}
        </div>
        <div
          className={`mb-1 flex items-center gap-1 border-b font-mono focus-within:border-accent ${
            targetInvalid || needsTarget ? 'border-neg' : 'border-line'
          }`}
        >
          <span aria-hidden='true' className='text-2xl text-muted'>
            $
          </span>
          <input
            id='ef-target'
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode='decimal'
            placeholder='None'
            aria-invalid={targetInvalid || needsTarget}
            aria-describedby='ef-target-hint'
            className='h-12 w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted/60'
          />
        </div>
        <p
          id='ef-target-hint'
          className={`mb-5 min-h-4 text-xs ${targetInvalid || needsTarget ? 'text-neg' : 'text-muted'}`}
        >
          {targetInvalid
            ? 'Enter an amount above $0.'
            : needsTarget
              ? 'A deadline needs a target amount.'
              : ''}
        </p>

        <div className='flex items-baseline justify-between'>
          <span className='text-xs font-medium text-muted'>Deadline</span>
          {hasDeadline && (
            <button
              type='button'
              onClick={removeDeadline}
              className='text-xs font-semibold text-accent'
            >
              Remove deadline
            </button>
          )}
        </div>
        {hasDeadline ? (
          <div className='mt-2 mb-5 flex items-center justify-between'>
            <button
              type='button'
              aria-label='Earlier deadline'
              disabled={!canEarlier}
              onClick={() => setOffset((o) => o - 1)}
              className='grid h-12 w-12 place-items-center rounded-[14px] bg-chip text-xl disabled:opacity-35'
            >
              ‹
            </button>
            <span
              aria-live='polite'
              className='font-mono text-xl font-semibold uppercase'
            >
              {formatDayUpper(parseTargetDate(deadline))}
            </span>
            <button
              type='button'
              aria-label='Later deadline'
              disabled={!canLater}
              onClick={() => setOffset((o) => o + 1)}
              className='grid h-12 w-12 place-items-center rounded-[14px] bg-chip text-xl disabled:opacity-35'
            >
              ›
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={addDeadline}
            className='mt-2 mb-5 h-12 w-full rounded-[14px] border border-dashed border-line text-sm font-semibold'
          >
            + Add a deadline
          </button>
        )}

        {preview && (
          <div className='rounded-[18px] border border-line bg-surface p-4'>
            <div className='font-mono text-2xl font-semibold text-accent'>
              {preview.headline}
            </div>
            <p className='mt-1 text-[13px] text-pretty text-muted'>
              {preview.detail}
            </p>
          </div>
        )}
      </div>
      <PrimaryButton
        className='mt-4'
        disabled={!canSave}
        onClick={() => void save()}
      >
        Save changes
      </PrimaryButton>
    </div>
  );
}
