import { describe, it, expect } from 'vitest';
import { getExtraDataCuits } from './extraDataCuits';

function fulfilled<T>(value: T): PromiseFulfilledResult<T> {
  return { status: 'fulfilled', value };
}

function rejected(reason = new Error('Error 500')): PromiseRejectedResult {
  return { status: 'rejected', reason };
}

const CUITS = ['20111111118', '20222222226', '20333333334'];

describe('getExtraDataCuits', () => {
  it('includes CUITs where both endpoints returned OK', () => {
    const debt = [fulfilled({}), fulfilled({}), fulfilled({})];
    const checks = [fulfilled({}), fulfilled({}), fulfilled({})];
    expect(getExtraDataCuits(CUITS, debt, checks)).toEqual(CUITS);
  });

  it('includes CUITs where only debt returned OK', () => {
    const debt = [fulfilled({}), rejected(), fulfilled({})];
    const checks = [rejected(), rejected(), rejected()];
    expect(getExtraDataCuits(CUITS, debt, checks)).toEqual([CUITS[0], CUITS[2]]);
  });

  it('includes CUITs where only checks returned OK', () => {
    const debt = [rejected(), rejected(), rejected()];
    const checks = [rejected(), fulfilled({}), rejected()];
    expect(getExtraDataCuits(CUITS, debt, checks)).toEqual([CUITS[1]]);
  });

  it('excludes CUITs where both endpoints returned 500', () => {
    const debt = [rejected(), rejected(), fulfilled({})];
    const checks = [rejected(), rejected(), fulfilled({})];
    expect(getExtraDataCuits(CUITS, debt, checks)).toEqual([CUITS[2]]);
  });

  it('excludes CUITs where both endpoints returned 404 (NotFoundError)', () => {
    const notFound = rejected(Object.assign(new Error('not found'), { name: 'NotFoundError' }));
    const debt = [notFound, fulfilled({})];
    const checks = [notFound, fulfilled({})];
    expect(getExtraDataCuits(CUITS.slice(0, 2), debt, checks)).toEqual([CUITS[1]]);
  });

  it('returns empty array when all endpoints failed', () => {
    const debt = [rejected(), rejected()];
    const checks = [rejected(), rejected()];
    expect(getExtraDataCuits(CUITS.slice(0, 2), debt, checks)).toEqual([]);
  });
});
