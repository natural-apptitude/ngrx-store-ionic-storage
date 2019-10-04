# ngrx-store-ionic-storage

Simple syncing between @ngrx 4 and Ionic Storage.

**If you are looking to use this package with an Ionic 4 app, please use [version 5](README.md) of this package.**

## Dependencies

This library depends on the store and effects modules from [@ngrx/platform](https://github.com/ngrx/platform) and [Ionic 2](https://ionicframework.com/docs/).

## Installation

Make sure you have a scaffolded Ionic 2 app. This library supports Ionic version 2 and above. For more details, see the [Ionic documentation](https://ionicframework.com/docs/v2/setup/installation/).

Then run:

```
npm install @ngrx/store@^4.1.1 @ngrx/effects@^4.1.1 @ionic/storage ngrx-store-ionic-storage --save
```

Next, make sure you have installed the `cordova-sqlite-storage` plugin. This allows Ionic Storage to use the most optimal storage mechanism available, depending on the target device.

```
ionic cordova plugin add cordova-sqlite-storage --save
```

## Usage

1. In your app's module, import the `StorageSyncEffects` and run it through the `EffectsModule`.
2. Pass options into the `storageSync` function to create a meta-reducer, and compose it with your other reducers.

Here is an example with two app-specific reducers, `books` and `collection`, and a state object `appState`.

``` js
import { NgModule } from '@angular/core';
import { StoreModule, ActionReducerMaps, ActionReducer, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StorageSyncEffects, storageSync } from 'ngrx-store-ionic-storage';
import { BookActions, CollectionActions } from './actions';
import { booksReducer, collectionReducer } from './reducers';
import { appState } from './app-state'

export function onSyncError(err) {
  console.log(err);
}

export const reducers: ActionReducerMap<appState> = {
  books: booksReducer,
  collection: collectionReducer
};

export const storageSyncReducer = storageSync({
  keys: ['collection'],   // Only sync the `collection` state
  ignoreActions: [        // Don't sync when these actions occur
    BookActions.SELECT,
    CollectionActions.FILTER,
  ],
  hydratedStateKey: 'hydrated', // Add this key to the state
  onSyncError: onSyncError      // If a sync fails
});

export function storageMetaReducer(reducer: ActionReducer<any>): ActionReducer<any, any> {
  return storageSyncReducer(reducer);
}

export const metaReducers: MetaReducer<any, any>[] = [storageMetaReducer];

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { 
      metaReducers,
      initialState: {
        hydrated: false
      }
    })
    EffectsModule.forRoot([ StorageSyncEffects ])
  ]
})
export class MyAppModule {}
```

### Options

- `keys`: specify the portion of your state to sync to the underlying storage mechanism.
- `ignoreActions`: don't sync whenever any of these actions are fired.
- `hydratedStateKey`: if present, the sync reducer will add a flag to your app state when the initial hydration has completed. You can bind an observable to this flag, and so be notified when the app has been hydrated.
- `onSyncError`: a callback, called whenever there was an error syncing the state. The callback is passed a single `err` parameter.

## If main reducer is an ActionReducerMap

`hydrated.reducer.ts`
```js
import { Action } from '@ngrx/store';

export interface HydratedState {}

export function reducer(state: boolean = false, action: Action): State {
    return state;
};
```

`main.reducer.ts`
```js
import { ActionReducerMap } from '@ngrx/store';
import * as fromHydrated from './hydrated.reducer';

export interface State {
    hydrated: fromHydrated.State
    //...
}

export const reducer: ActionReducerMap<State> = {
    hydrated: fromHydrated.reducer
    //...
};
```

## How It Works

The sync reducer is a meta-reducer. On startup, it hydrates the initial state from the underlying storage mechanism. Then, whenever an action is dispatched to the store, the sync reducer saves the portion of state to the underlying storage mechanism, after all other reducers have run.

The sync reducer will only store the portion of state provided in the `keys` option, and will not run for any actions that are specified in the `ignoreActions` option.

## Why?

Much of this library is based on [ngrx-store-localstorage](https://github.com/btroncone/ngrx-store-localstorage). While this is an excellent choice for desktop web browsers, for Ionic apps a better solution exists for local storage: [Ionic Storage](https://ionicframework.com/docs/v2/storage/). This provides a more robust storage mechanism, depending on the device where the app is running. Since Ionic Storage is asynchronous, the functionality needed to be written from the ground-up to support an async get/set operation.

## License

MIT
