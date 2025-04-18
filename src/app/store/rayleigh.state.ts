import { signalStoreFeature, withState, withMethods, patchState } from '@ngrx/signals';
import { ResultAspect } from 'src/app/view3d/materials/rayleigh.material';

export enum ResultSet {
  XZPlane,
  YZPlane,
  CutCube,
}

interface RayleighState {
  aspect: ResultAspect;
  resultSet: ResultSet;
}

export const withRayleigh = () => signalStoreFeature(
  withState<RayleighState>({
    aspect: ResultAspect.Elongation,
    resultSet: ResultSet.XZPlane,
  }),
  withMethods((store) => ({
    setAspect: (aspect: ResultAspect) => {
      patchState(store, { aspect });
    },
    setResultSet: (resultSet: ResultSet) => {
      patchState(store, { resultSet });
    },
  }))
);

