import fs from 'fs';

import moment from 'moment';

import { POOLS, TOKENS } from '../constants';
import { STRINGS } from '../constants';
import {
  CUSTOM_RANGE_FILTER,
  LATEST_CUSTOM_FILTER,
  LATEST_DAY_FILTER,
} from '../constants/filters';
import { DATE_SCALE, DATE_SCALE_NUM } from '../models/date-scale';

export const readFile = (filepath: string): string =>
  fs.readFileSync(filepath).toString('utf-8');

export const getPoolIdByNetwork = (poolName: string, chainId: number) => {
  const pool = POOLS.find((pool) => pool.symbol === poolName);
  return pool?.id[chainId];
};

export const getTokenByContract = (contract: string, chainId) =>
  TOKENS.find((token) => token.contracts[chainId] === contract);

export const formatUTC = (date: moment.Moment) => date.utc().toISOString();

export const isDefined = (obj: unknown) => typeof obj !== 'undefined';
export const isNull = (obj: unknown) => isDefined(obj) && obj === null;
export const isNotNullAndDefined = (obj: unknown) =>
  isDefined(obj) && !isNull(obj);
export const isNotEmpty = (obj: unknown) =>
  isDefined(obj) && !isNull(obj) && obj !== '';

export const hasQuery = (request: { query?: unknown }) =>
  isNotNullAndDefined(request) && isNotNullAndDefined(request.query);

export const parseQueryToFilter = (query: {
  start_date?: string;
  end_date?: string;
  scale?: string;
  custom?: number;
}) => {
  let _parsed = { ...LATEST_DAY_FILTER };

  if (isNotEmpty(query.start_date) && isNotEmpty(query.end_date)) {
    // range is set
    _parsed = {
      ..._parsed,
      start_date: formatUTC(
        moment(query.start_date, STRINGS.DEFAULT_DATE_FORMAT)
      ),
      end_date: formatUTC(moment(query.end_date, STRINGS.DEFAULT_DATE_FORMAT)),
    };
  } else if (isNotEmpty(query.start_date) && !isDefined(query.end_date)) {
    // single date is set
    // default get current
    // check if scale is present

    const TYPE = isNotEmpty(query.custom) ? DATE_SCALE_NUM : DATE_SCALE;
    const scale = isNotEmpty(query.scale)
      ? TYPE[query.scale.toUpperCase()]
      : TYPE.MONTH;

    const filter: (
      startDate: string,
      scale: DATE_SCALE | DATE_SCALE_NUM
    ) => any = isNotEmpty(query.custom)
      ? CUSTOM_RANGE_FILTER
      : LATEST_CUSTOM_FILTER;

    _parsed = {
      ..._parsed,
      ...filter(query.start_date, scale as never),
    };
  }

  return _parsed;
};

export const isValidDateRange = (startDate: string, endDate: string) =>
  moment(startDate).isSameOrBefore(moment(endDate)) &&
  moment(endDate).isSameOrAfter(moment(startDate));
