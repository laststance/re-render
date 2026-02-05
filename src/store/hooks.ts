import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

/**
 * Typed version of useDispatch for this app's store
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/**
 * Typed version of useSelector for this app's store
 */
export const useAppSelector = useSelector.withTypes<RootState>()
