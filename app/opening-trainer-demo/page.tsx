'use client';

import React, { useState } from 'react';
import OpeningTrainerShellV2 from '@/redesign/components/OpeningTrainerShellV2';

/**
 * Standalone Opening Trainer Demo Page
 * Uses the new OpeningTrainerShellV2 with state machine architecture
 */
export default function OpeningTrainerDemoPage() {
  return (
    <div className="w-full h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      <OpeningTrainerShellV2 />
    </div>
  );
}
