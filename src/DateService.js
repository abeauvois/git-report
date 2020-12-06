import { DateTime, Settings } from "luxon";

const DATE_TIME_ISO = "2016-05-25T09:24:15";
const ANOTHER_DATE_TIME_ISO = "2017-08-22T15:23:00";
const TIMEZONE = "Europe/Copenhagen";

const DATE_TIME_INSTANCE = DateTime.fromISO(DATE_TIME_ISO);
const ANOTHER_DATE_TIME_INSTANCE = DateTime.fromISO(
  ANOTHER_DATE_TIME_ISO
);

export class {
  static parseISO() {
    DateTime.fromISO(DATE_TIME_ISO);
  }

  static formatInstance() {
    DATE_TIME_INSTANCE.toFormat("yyyy-MM-dd");
  }

  static tranformInstance() {
    DATE_TIME_INSTANCE.plus({ years: 2 });
  }

  static diffBetweenInstances() {
    DATE_TIME_INSTANCE.diff(ANOTHER_DATE_TIME_INSTANCE, "months").toObject();
  }

  static compareInstances() {
    return (
      DATE_TIME_INSTANCE.startOf("day") <
      ANOTHER_DATE_TIME_INSTANCE.startOf("day")
    );
  }

  static timezone() {
    DateTime.fromISO(DATE_TIME_ISO).setZone(TIMEZONE);
  }

  static setGlobalLocale() {
    Settings.defaultLocale = "en-nz";
  }
};