import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { LivePreviewHandle } from './livePreviewExamples'
import {
  StateChangePreview,
  PropsChangePreview,
  ParentRerenderPreview,
  ContextChangePreview,
  ForceUpdatePreview,
  UseCallbackPreview,
  UseMemoPreview,
  ReactLazyPreview,
  ChildrenPatternPreview,
  UseReducerPreview,
  UseSyncExternalStorePreview,
  SuspensePreview,
  ConcurrentPreview,
  UseEffectDepsPreview,
  RefVsStatePreview,
  CompoundComponentPreview,
  RenderPropsPreview,
} from './livePreviewExamples'

/**
 * Type for live preview components with imperative handle.
 */
export type LivePreviewComponent = ForwardRefExoticComponent<
  RefAttributes<LivePreviewHandle>
>

/**
 * Map of example IDs to their live preview components.
 * Separated from component definitions to satisfy react-refresh.
 */
export const livePreviewMap: Record<string, LivePreviewComponent> = {
  'state-change': StateChangePreview,
  'props-change': PropsChangePreview,
  'parent-rerender': ParentRerenderPreview,
  'context-change': ContextChangePreview,
  'force-update': ForceUpdatePreview,
  usecallback: UseCallbackPreview,
  usememo: UseMemoPreview,
  'react-lazy': ReactLazyPreview,
  'children-pattern': ChildrenPatternPreview,
  'use-reducer': UseReducerPreview,
  'use-sync-external-store': UseSyncExternalStorePreview,
  suspense: SuspensePreview,
  concurrent: ConcurrentPreview,
  'use-effect-deps': UseEffectDepsPreview,
  'ref-vs-state': RefVsStatePreview,
  'compound-component': CompoundComponentPreview,
  'render-props': RenderPropsPreview,
}
