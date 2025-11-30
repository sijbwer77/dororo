const STAGE_SEQUENCE = [
  {
    label: "STAGE 1 > STEP 1",
    start: 0,
    end: 100,
    type: "stage1",
    displayRelative: false,
    submarine: {
      src: null,
      width: 180,
      height: 148,
      variant: null,
    },
  },
  {
    label: "STAGE 1 > STEP 2",
    start: 100,
    end: 250,
    type: "stage1",
    displayRelative: false,
    submarine: {
      src: "/submarine-white.svg",
      width: 180,
      height: 148,
      variant: "white",
    },
  },
  {
    label: "STAGE 1 > STEP 3",
    start: 250,
    end: 500,
    type: "stage1",
    displayRelative: false,
    submarine: {
      src: "/submarine-red.svg",
      width: 266,
      height: 197,
      variant: "red",
    },
  },
  {
    label: "STAGE 1 > STEP 4",
    start: 500,
    end: 800,
    type: "stage1",
    displayRelative: false,
    submarine: {
      src: "/submarine-blue.svg",
      width: 266,
      height: 197,
      variant: "blue",
    },
  },
  {
    label: "STAGE 1 > STEP 5",
    start: 800,
    end: 1200,
    type: "stage1",
    displayRelative: false,
    submarine: {
      src: "/submarine-full.svg",
      width: 288,
      height: 212,
      variant: "full",
    },
  },
  {
    label: "STAGE 2 > STEP 1",
    start: 1201,
    end: 1401,
    type: "stage2",
    displayRelative: true,
    displayTarget: 200,
    background: "/D_step1.svg",
    submarine: null,
    badges: [],
  },
  {
    label: "STAGE 2 > STEP 2",
    start: 1401,
    end: 1951,
    type: "stage2",
    displayRelative: true,
    displayTarget: 550,
    background: "/D_step2.svg",
    submarine: null,
    badges: [],
  },
  {
    label: "STAGE 2 > STEP 3",
    start: 1751,
    end: 2901,
    type: "stage2",
    displayRelative: true,
    displayTarget: 1150,
    background: "/D_step3.svg",
    submarine: null,
    badges: [],
  },
  {
    label: "STAGE 2 > STEP 4",
    start: 2351,
    end: 4401,
    type: "stage2",
    displayRelative: true,
    displayTarget: 2050,
    background: "/D_step4.svg",
    submarine: null,
    badges: [],
  },
  {
    label: "STAGE 2 > STEP 5",
    start: 3251,
    end: 6251,
    type: "stage2",
    displayRelative: true,
    displayTarget: 3000,
    background: "/D_step5.svg",
    submarine: null,
    badges: [],
  },
  {
    label: "STAGE 2 > STEP 6",
    start: 4201,
    end: 7201,
    type: "stage2",
    displayRelative: true,
    displayTarget: 3000,
    alwaysFullGauge: true,
    background: "/D_step6.svg",
    submarine: null,
    badges: [],
  },
];

const TRAIT_BADGES = [
  {
    trait: "D",
    minExp: 1401,
    badge: {
      src: "/sand_shark.svg",
      width: 360,
      height: 135,
      className: "stageTwoBadgeShark",
      offset: { bottom: 0, right: 375 },
    },
  },
  {
    trait: "D",
    minExp: 1751,
    badge: {
      src: "/broadmouth_shark.svg",
      width: 900,
      height: 350,
      className: "stageTwoBadgeShark",
      offset: { bottom: 0, right: 70 },
    },
  },
];

const TRAIT_STAGE_OVERRIDES = [
  {
    trait: "I",
    label: "STAGE 2 > STEP 1",
    background: "/I_step1.svg",
  },
  {
    trait: "I",
    label: "STAGE 2 > STEP 2",
    background: "/I_step2.svg",
  },
  {
    trait: "I",
    label: "STAGE 2 > STEP 3",
    background: "/I_step3.svg",
  },
  {
    trait: "I",
    label: "STAGE 2 > STEP 4",
    background: "/I_step4.svg",
  },
  {
    trait: "I",
    label: "STAGE 2 > STEP 5",
    background: "/I_step5.svg",
  },
  {
    trait: "I",
    label: "STAGE 2 > STEP 6",
    background: "/I_step6.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 1",
    background: "/M_step1.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 2",
    background: "/M_step2.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 3",
    background: "/M_step3.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 4",
    background: "/M_step4.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 5",
    background: "/M_step5.svg",
  },
  {
    trait: "M",
    label: "STAGE 2 > STEP 6",
    background: "/M_step6.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 1",
    background: "/C_step1.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 2",
    background: "/C_step2.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 3",
    background: "/C_step3.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 4",
    background: "/C_step4.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 5",
    background: "/C_step5.svg",
  },
  {
    trait: "C",
    label: "STAGE 2 > STEP 6",
    background: "/C_step6.svg",
  },
];

export function getStageInfo(exp, trait = "D") {
  let activeStage = STAGE_SEQUENCE[0];

  for (const stage of STAGE_SEQUENCE) {
    if (exp >= stage.start) {
      activeStage = stage;
    }
  }

  const stageEnd = activeStage.end;
  const safeExp = Math.min(exp, stageEnd);
  const progressValue = Math.max(safeExp - activeStage.start, 0);
  const stageRange = activeStage.displayTarget ?? stageEnd - activeStage.start;
  const stageDisplayStart = activeStage.type === "stage2" ? activeStage.start - 1200 : 0;
  const displayStart =
    activeStage.type === "stage2" ? stageDisplayStart : activeStage.displayStart ?? 0;
  let displayCurrent = activeStage.displayRelative ? progressValue + displayStart : safeExp;
  let displayTarget = activeStage.displayRelative ? stageRange : stageEnd;
  let baseBadges = [...(activeStage.badges ?? [])];

  if (activeStage.displayRelative) {
    displayCurrent = Math.min(displayCurrent, displayTarget);
  }
  let progressPercent;
  if (activeStage.displayRelative) {
    if (activeStage.type === "stage2" && activeStage.alwaysFullGauge) {
      progressPercent = 100;
    } else if (activeStage.type === "stage2") {
      const displayOffset = stageDisplayStart;
      const denom = Math.max(1, displayTarget - displayOffset);
      const numer = Math.max(0, displayCurrent - displayOffset);
      progressPercent = Math.min((numer / denom) * 100, 100);
    } else {
      progressPercent = stageRange > 0 ? Math.min((progressValue / stageRange) * 100, 100) : 0;
    }
  } else {
    progressPercent = stageRange > 0 ? (progressValue / stageRange) * 100 : 0;
  }

  if (activeStage.type !== "stage2") {
    TRAIT_BADGES.forEach((traitBadge) => {
      if (traitBadge.trait === trait && exp >= traitBadge.minExp) {
        baseBadges.push(traitBadge.badge);
      }
    });
  }

  let background = activeStage.background;
  const stageOverride = TRAIT_STAGE_OVERRIDES.find(
    (o) => o.trait === trait && o.label === activeStage.label
  );
  if (stageOverride?.background) {
    background = stageOverride.background;
  }

  return {
    ...activeStage,
    background,
    end: stageEnd,
    safeExp,
    progressValue,
    stageRange,
    progressPercent,
    displayCurrent,
    displayTarget,
    badges: baseBadges,
  };
}
