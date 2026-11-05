import { VisitMethod } from '../../visits/visit.schema';

export interface TrailStep {
  /** Minutes after the seed hour begins. */
  minute: number;
  address: string;
  method: VisitMethod;
}

export interface SeedTrail {
  person: string;
  steps: TrailStep[];
}

/**
 * All trails run inside one hour (18:00–19:00 UTC on the seed day) so the
 * history reads like one busy evening rather than a week of noise. Nadia walks
 * nearly the whole web; several people repeat visits; two trails contain a
 * dead address and a jump backwards.
 */
export const TRAILS: SeedTrail[] = [
  {
    person: 'nadia',
    steps: [
      { minute: 2, address: 'tidepool.zz', method: 'typed' },
      { minute: 6, address: 'saltmarsh.zz', method: 'link' },
      { minute: 10, address: 'rainfall.zz', method: 'link' },
      { minute: 13, address: 'paperlanes.zz', method: 'link' },
      { minute: 16, address: 'mothbook.zz', method: 'link' },
      { minute: 18, address: 'northlight.zz', method: 'link' },
      { minute: 20, address: 'mothbook.zz', method: 'back' },
      { minute: 22, address: 'paperlanes.zz', method: 'back' },
      { minute: 25, address: 'harbours.zz', method: 'link' },
      { minute: 28, address: 'tinners.zz', method: 'link' },
      { minute: 31, address: 'bellwether.zz', method: 'link' },
      { minute: 34, address: 'lantern.zz', method: 'link' },
      { minute: 37, address: 'copperwire.zz', method: 'link' },
      { minute: 39, address: 'wireless.zz', method: 'link' },
      { minute: 41, address: 'copperwire.zz', method: 'back' },
      { minute: 44, address: 'tidepool.zz', method: 'history' },
      { minute: 48, address: 'paperlanes.zz', method: 'search' },
      { minute: 51, address: 'rainfall.zz', method: 'link' },
      { minute: 54, address: 'tidepool.zz', method: 'typed' },
    ],
  },
  {
    person: 'ivo',
    steps: [
      { minute: 5, address: 'lantern.zz', method: 'typed' },
      { minute: 8, address: 'copperwire.zz', method: 'link' },
      { minute: 11, address: 'tinners.zz', method: 'link' },
      { minute: 14, address: 'bellwether.zz', method: 'link' },
      { minute: 16, address: 'tinners.zz', method: 'back' },
      { minute: 18, address: 'bellwether.zz', method: 'forward' },
      { minute: 21, address: 'copperwire.zz', method: 'history' },
      { minute: 24, address: 'lantern.zz', method: 'link' },
      { minute: 27, address: 'wireless.zz', method: 'link' },
      { minute: 29, address: 'lantern.zz', method: 'back' },
      { minute: 33, address: 'copperwire.zz', method: 'typed' },
      { minute: 38, address: 'rainfall.zz', method: 'link' },
    ],
  },
  {
    person: 'wren',
    steps: [
      { minute: 9, address: 'rainfall.zz', method: 'typed' },
      { minute: 12, address: 'paperlanes.zz', method: 'link' },
      { minute: 15, address: 'mothbook.zz', method: 'link' },
      { minute: 18, address: 'paperlanes.zz', method: 'back' },
      { minute: 21, address: 'rainfall.zz', method: 'back' },
      { minute: 25, address: 'tidepool.zz', method: 'search' },
      { minute: 28, address: 'saltmarsh.zz', method: 'link' },
      { minute: 33, address: 'rainfall.zz', method: 'typed' },
      { minute: 37, address: 'paperlanes.zz', method: 'search' },
    ],
  },
  {
    person: 'osric',
    steps: [
      { minute: 14, address: 'bellwether.zz', method: 'typed' },
      { minute: 18, address: 'tinners.zz', method: 'link' },
      { minute: 22, address: 'harbours.zz', method: 'link' },
      { minute: 26, address: 'bellwether.zz', method: 'typed' },
      { minute: 31, address: 'lantern.zz', method: 'search' },
      { minute: 35, address: 'copperwire.zz', method: 'link' },
      { minute: 39, address: 'mothcatchers.zz', method: 'link' },
      { minute: 43, address: 'bellwether.zz', method: 'history' },
    ],
  },
  {
    person: 'maren',
    steps: [
      { minute: 20, address: 'saltmarsh.zz', method: 'typed' },
      { minute: 23, address: 'tidepool.zz', method: 'link' },
      { minute: 26, address: 'rainfall.zz', method: 'link' },
      { minute: 29, address: 'brinewell.zz', method: 'link' },
      { minute: 31, address: 'tidepool.zz', method: 'back' },
      { minute: 34, address: 'saltmarsh.zz', method: 'back' },
      { minute: 38, address: 'paperlanes.zz', method: 'search' },
      { minute: 42, address: 'mothbook.zz', method: 'link' },
      { minute: 46, address: 'saltmarsh.zz', method: 'typed' },
      { minute: 50, address: 'northlight.zz', method: 'typed' },
    ],
  },
  {
    person: 'tomas',
    steps: [
      { minute: 32, address: 'tinners.zz', method: 'typed' },
      { minute: 36, address: 'copperwire.zz', method: 'link' },
      { minute: 40, address: 'bellwether.zz', method: 'link' },
      { minute: 44, address: 'harbours.zz', method: 'link' },
      { minute: 48, address: 'tinners.zz', method: 'history' },
      { minute: 52, address: 'theoldpier.zz', method: 'typed' },
    ],
  },
];
