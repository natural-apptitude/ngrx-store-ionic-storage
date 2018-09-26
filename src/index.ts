import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { ActionReducer } from '@ngrx/store';
import { Observable, of, defer } from 'rxjs';

import { fromPromise } from 'rxjs/internal-compatibility';
import { map, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage';

export const STORAGE_STATE_KEY = 'APP_STATE';

const storage = new Storage({});

// get/setNested inspired by
// https://github.com/mickhansen/dottie.js
function getNested(obj: any, path: string): any {
  if (obj !== null && path) {
    // Recurse into the object.
    const parts = path.split('.').reverse();
    while (obj != null && parts.length) {
      obj = obj[parts.pop()];
    }
  }
  return obj;
}

function setNested(obj: any, path: string, value: any): any {
  if (obj != null && path) {
    let pieces = path.split('.'),
      current = obj,
      piece, i,
      length = pieces.length;

    for (i = 0; i < length; i++) {
      piece = pieces[i];
      if (i === length - 1) {
        current[piece] = value;
      } else if (!current[piece]) {
        current[piece] = {};
      }
      current = current[piece];
    }
  }

  return obj;
}

function fetchState(): Promise<{}> {
  return storage
    .get(STORAGE_STATE_KEY)
    .then(s => s || {})
    .catch(err => {
    });
}

function saveState(state: any, keys: string[]): Promise<void> {
  // Pull out the portion of the state to save.
  if (keys) {
    state = keys.reduce((acc, k) => {
      const val = getNested(state, k);
      if (val) {
        setNested(acc, k, val);
      }
      return acc;
    }, {})
  }

  return storage.set(STORAGE_STATE_KEY, state);
}

export const StorageSyncActions = {
  HYDRATED: 'APP_STATE_REHYDRATE'
};

@Injectable()
export class StorageSyncEffects {

  @Effect() hydrate$: Observable<any> = defer(() =>
    fromPromise(fetchState())
      .pipe(
        map(state => ({
          type: StorageSyncActions.HYDRATED,
          payload: state
        })),
        catchError(e => {
          console.warn(`error fetching data from store for hydration: ${e}`);

          return of({
            type: StorageSyncActions.HYDRATED,
            payload: {}
          });
        })
      )
  );
}

export interface StorageSyncOptions {
  keys?: string[];
  ignoreActions?: string[];
  hydratedStateKey?: string;
  onSyncError?: (err: any) => void;
}

const defaultOptions: StorageSyncOptions = {
  keys: [],
  ignoreActions: [],
  onSyncError: (err) => {
  }
};

export const storageSync = (options?: StorageSyncOptions) => {
  const {keys, ignoreActions, hydratedStateKey, onSyncError} = Object.assign({}, defaultOptions, options || {});

  ignoreActions.push(StorageSyncActions.HYDRATED);
  ignoreActions.push('@ngrx/store/init');
  ignoreActions.push('@ngrx/effects/init');
  ignoreActions.push('@ngrx/store/update-reducers');

  const hydratedState: any = {};

  return function storageSyncReducer(reducer: ActionReducer<any>) {
    return (state: any, action: any) => {
      const {type, payload} = action;

      if (type === StorageSyncActions.HYDRATED) {
        state = Object.assign({}, state, payload);
        if (hydratedStateKey) {
          hydratedState[hydratedStateKey] = true;
        }
      }

      const nextState = Object.assign({}, reducer(state, action), hydratedState);

      if (ignoreActions.indexOf(type) === -1) {
        saveState(nextState, keys).catch(err => onSyncError(err));
      }

      return nextState;
    }
  }
};
