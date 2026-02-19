import React from 'react';
import clsx from 'clsx';

type SkeletonProps = {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={clsx(
      'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60',
      className
    )}
  />
);

