import moment from 'moment';
import { formatUTC } from '../lib/utils';
import { DATE_SCALE, DATE_SCALE_NUM } from '../models/date-scale';

export const LATEST_MONTH_FILTER = {
  start_date: moment().startOf('M').utc().toISOString(),
  end_date: moment().endOf('M').utc().toISOString(),
};

export const LATEST_DAY_FILTER = {
  start_date: moment().startOf('D').utc().toISOString(),
  end_date: moment().endOf('D').utc().toISOString(),
};

export const LATEST_WEEK_FILTER = {
  start_date: moment().startOf('week').utc().toISOString(),
  end_date: moment().endOf('week').utc().toISOString(),
};

export const LATEST_CUSTOM_FILTER = (
  setDate: string,
  scale: DATE_SCALE = DATE_SCALE.MONTH
) => {
  const _date = moment(setDate, 'YYYY-MM-DD');
  const filter = {
    start_date: formatUTC(moment(_date).startOf(scale)),
    end_date: formatUTC(moment(_date).endOf(scale)),
  };

  return filter;
};

export const CUSTOM_RANGE_FILTER = (
  startDate: string,
  scale: DATE_SCALE_NUM = DATE_SCALE_NUM.MONTH
) => {
  const _date = moment(startDate, 'YYYY-MM-DD');
  const filter = {
    start_date: formatUTC(moment(_date)),
    end_date: formatUTC(moment(_date).add(scale, 'days')),
  };

  return filter;
};
