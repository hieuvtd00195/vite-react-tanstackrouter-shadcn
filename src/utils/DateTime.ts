import dayjs from 'dayjs'

// Plugins
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'

// Dayjs locale
import 'dayjs/locale/en'
import 'dayjs/locale/vi'

import type {Dayjs} from 'dayjs'
import { DateFormat } from '@/lib/locale'

class DateTime {
  constructor() {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.extend(customParseFormat)
    dayjs.extend(updateLocale)
  }

  public initLocale() {
    dayjs.updateLocale('vi', {
      months: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12'
      ]
    })
  }

  public IsValid(date: any) {
    if (!date) return false
    return dayjs(date)
      .isValid()
  }

  public TimeZone() {
    return dayjs.tz.guess()
  }

  public Format(value: any, pattern: string = DateFormat) {
    return this.IsValid(value) ? dayjs(value)
      .format(pattern) : null
  }

  public ToString(value: Date | Dayjs | number): string
  public ToString(value?: Date | null): string | null
  public ToString(value?: any) {
    return this.IsValid(value) ? dayjs(value)
      .toISOString() : null
  }

  public StartOfDay(value: Date | Dayjs | number, pattern?: string): string
  public StartOfDay(value?: Date | null, pattern?: string): string | null
  public StartOfDay(value?: any, pattern?: string) {
    return this.IsValid(value) ? pattern ? dayjs(value)
      .startOf('day')
      .format(pattern) : dayjs(value)
      .startOf('day')
      .toISOString() : null
  }

  public EndOfDay(value: Date | Dayjs | number, pattern?: string): string
  public EndOfDay(value?: Date | null, pattern?: string): string | null
  public EndOfDay(value?: any, pattern?: string) {
    return this.IsValid(value) ? pattern ? dayjs(value)
      .endOf('day')
      .format(pattern) : dayjs(value)
      .endOf('day')
      .toISOString() : null
  }

  public Instance(value: Date | Dayjs | number): Dayjs
  public Instance(value?: Date | null): Dayjs | null
  public Instance(value?: any) {
    return this.IsValid(value) ? dayjs(value) : null
  }

  public currentDateTime(format = DateFormat) {
    return dayjs()
      .format(format)
  }

  public Year(value: Date | Dayjs | number, pattern?: string): string;
  public Year(value?: Date | null, pattern?: string): string | null;
  public Year(value?: any, pattern?: string): string | null {
    if (!this.IsValid(value)) {
      return null;
    }

    const year = dayjs(value).year(); // Lấy giá trị năm
    return pattern ? year.toString().padStart(pattern.length, '0') : year.toString();
  }



  public current() {
    return dayjs()
  }
}

export default new DateTime()
