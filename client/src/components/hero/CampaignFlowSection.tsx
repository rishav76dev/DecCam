import { memo, useEffect, useMemo, useState } from "react";
import {
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type FlowLogo = {
  alt: string;
  src: string;
};

type FlowCardData = {
  description: string;
  eyebrow: string;
  footerLabel: string;
  footerValue: string;
  isActive?: boolean;
  isComplete?: boolean;
  isEmphasis?: boolean;
  logos?: FlowLogo[];
  title: string;
};

type FlowCardNode = Node<FlowCardData, "flowCard">;
type FlowAnimationEdge = Edge<Record<string, never>, "flow">;

const MONAD_LOGO: FlowLogo = {
  alt: "Monad",
  src: "/monad.png",
};

const X_LOGO: FlowLogo = {
  alt: "X",
  src: "/twitter.png",
};

const FLOW_NODE_ORDER = [
  "create",
  "apply",
  "active",
  "sync",
  "finalize",
  "payout-a",
  "payout-b",
  "payout-c",
] as const;

const EDGE_LEAD_BY_NODE: Record<string, string[]> = {
  create: [],
  apply: ["e-create-apply"],
  active: ["e-apply-active"],
  sync: ["e-active-sync"],
  finalize: ["e-sync-finalize"],
  "payout-a": ["e-finalize-a"],
  "payout-b": ["e-finalize-b"],
  "payout-c": ["e-finalize-c"],
};

const NODE_INDEX: Record<string, number> = FLOW_NODE_ORDER.reduce(
  (acc, nodeId, index) => {
    acc[nodeId] = index;
    return acc;
  },
  {} as Record<string, number>,
);

const FLOW_STEP_MS = 1500;

const nodeTypes = {
  flowCard: memo(
    ({ data, sourcePosition, targetPosition }: NodeProps<FlowCardNode>) => (
      <div
        className={`campaign-flow-node${data.isEmphasis ? " is-emphasis" : ""}${data.isComplete ? " is-complete" : ""}${data.isActive ? " is-active" : ""}`}
      >
        <Handle
          type="target"
          position={targetPosition ?? Position.Left}
          className="campaign-flow-handle"
        />

        <div className="campaign-flow-node-head">
          <p className="campaign-flow-node-eyebrow">{data.eyebrow}</p>

          {data.logos?.length ? (
            <div className="campaign-flow-node-logos" aria-hidden="true">
              {data.logos.map((logo) => (
                <span key={`${data.title}-${logo.alt}`} className="campaign-flow-node-logo">
                  <img src={logo.src} alt="" />
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <h3 className="campaign-flow-node-title">{data.title}</h3>
        <p className="campaign-flow-node-description">{data.description}</p>

        <div className="campaign-flow-node-footer">
          <span>{data.footerLabel}</span>
          <strong>{data.footerValue}</strong>
        </div>

        <Handle
          type="source"
          position={sourcePosition ?? Position.Right}
          className="campaign-flow-handle"
        />
      </div>
    ),
  ),
};

const edgeTypes = {
  flow: memo(
    ({
      id,
      animated,
      interactionWidth,
      markerEnd,
      markerStart,
      pathOptions,
      sourcePosition,
      sourceX,
      sourceY,
      style,
      targetPosition,
      targetX,
      targetY,
    }: EdgeProps<FlowAnimationEdge>) => {
      const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        ...(pathOptions ?? {}),
      });
      const motionPathId = `campaign-flow-motion-${id}`;

      return (
        <>
          <path id={motionPathId} d={edgePath} fill="none" stroke="none" />

          <BaseEdge
            id={id}
            path={edgePath}
            style={style}
            markerEnd={markerEnd}
            markerStart={markerStart}
            interactionWidth={interactionWidth}
          />

          {animated ? (
            <>
              <path
                d={edgePath}
                fill="none"
                className="campaign-flow-edge-active-path"
              />

              <circle r="8" className="campaign-flow-edge-dot campaign-flow-edge-dot-glow">
                <animateMotion
                  dur={`${FLOW_STEP_MS}ms`}
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href={`#${motionPathId}`} />
                </animateMotion>
              </circle>
              <circle r="4.5" className="campaign-flow-edge-dot">
                <animateMotion
                  dur={`${FLOW_STEP_MS}ms`}
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href={`#${motionPathId}`} />
                </animateMotion>
              </circle>
            </>
          ) : null}
        </>
      );
    },
  ),
};

function createNodes(activeNodeId: string): FlowCardNode[] {
  const activeIndex = NODE_INDEX[activeNodeId] ?? 0;
  const getState = (nodeId: string) => {
    const nodeIndex = NODE_INDEX[nodeId] ?? -1;
    return {
      isActive: nodeId === activeNodeId,
      isComplete: nodeIndex > -1 && nodeIndex < activeIndex,
    };
  };

  return [
    {
      id: "create",
      type: "flowCard",
      position: { x: 0, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "1. Created",
        title: "Campaign funded",
        description: "Brand locks reward pool and deadline on Monad.",
        footerLabel: "Budget",
        footerValue: "Escrowed",
        logos: [MONAD_LOGO],
        ...getState("create"),
      },
    },
    {
      id: "apply",
      type: "flowCard",
      position: { x: 222, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "2. Join",
        title: "Creators apply",
        description: "Users submit wallet address and X post link.",
        footerLabel: "Input",
        footerValue: "Wallet + post",
        logos: [X_LOGO],
        ...getState("apply"),
      },
    },
    {
      id: "active",
      type: "flowCard",
      position: { x: 444, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "3. Live",
        title: "Views accumulate",
        description: "Content earns reach while the campaign stays open.",
        footerLabel: "Status",
        footerValue: "Active",
        logos: [X_LOGO, MONAD_LOGO],
        ...getState("active"),
      },
    },
    {
      id: "sync",
      type: "flowCard",
      position: { x: 666, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "4. Ended",
        title: "Views synced",
        description: "Worker writes verified X views back on-chain.",
        footerLabel: "Source",
        footerValue: "Real views",
        logos: [X_LOGO, MONAD_LOGO],
        ...getState("sync"),
      },
    },
    {
      id: "finalize",
      type: "flowCard",
      position: { x: 888, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "5. Split",
        title: "Rewards finalized",
        description: "Budget is divided by each creator's share of views.",
        footerLabel: "Formula",
        footerValue: "views / total × budget",
        isEmphasis: true,
        logos: [MONAD_LOGO],
        ...getState("finalize"),
      },
    },
    {
      id: "payout-a",
      type: "flowCard",
      position: { x: 1110, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "Creator A",
        title: "42k views",
        description: "Highest reach captures the biggest payout share.",
        footerLabel: "Payout",
        footerValue: "0.84 ETH",
        logos: [X_LOGO],
        ...getState("payout-a"),
      },
    },
    {
      id: "payout-b",
      type: "flowCard",
      position: { x: 1110, y: 122 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "Creator B",
        title: "28k views",
        description: "Mid-tier performance still earns proportionally.",
        footerLabel: "Payout",
        footerValue: "0.56 ETH",
        logos: [X_LOGO],
        ...getState("payout-b"),
      },
    },
    {
      id: "payout-c",
      type: "flowCard",
      position: { x: 1110, y: 244 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        eyebrow: "Creator C",
        title: "15k views",
        description: "Remaining rewards settle and can be claimed.",
        footerLabel: "Payout",
        footerValue: "0.30 ETH",
        logos: [MONAD_LOGO],
        ...getState("payout-c"),
      },
    },
  ];
}

function createEdges(activeNodeId: string): Edge[] {
  const activeIndex = NODE_INDEX[activeNodeId] ?? 0;
  const activeEdgeIds = new Set(EDGE_LEAD_BY_NODE[activeNodeId] ?? []);

  const isEdgeComplete = (sourceId: string, targetId: string) => {
    const sourceIndex = NODE_INDEX[sourceId] ?? -1;
    const targetIndex = NODE_INDEX[targetId] ?? -1;
    return sourceIndex > -1 && targetIndex > -1 && targetIndex <= activeIndex;
  };

  const withState = (edge: Edge) => {
    const edgeIsActive = activeEdgeIds.has(edge.id);
    const edgeIsComplete = isEdgeComplete(edge.source, edge.target);
    const baseStyle = edge.style ?? {};

    return {
      ...edge,
      className: `${edge.className ?? ""} ${edgeIsActive ? "is-flow-active" : ""}`.trim(),
      animated: edgeIsActive,
      style: {
        ...baseStyle,
        stroke: edgeIsActive ? "#84cc16" : edgeIsComplete ? "#374151" : "#9ca3af",
        strokeWidth: edgeIsActive ? 1.7 : 1.45,
        opacity: 1,
        strokeDasharray: edgeIsActive ? "1 12" : undefined,
      },
    } satisfies Edge;
  };

  const flowEdges: Edge[] = [
    {
      id: "e-create-apply",
      source: "create",
      target: "apply",
      type: "flow",
      style: { stroke: "#111827", strokeWidth: 1.5 },
    },
    {
      id: "e-apply-active",
      source: "apply",
      target: "active",
      type: "flow",
      style: { stroke: "#111827", strokeWidth: 1.5 },
    },
    {
      id: "e-active-sync",
      source: "active",
      target: "sync",
      type: "flow",
      style: { stroke: "#111827", strokeWidth: 1.5 },
    },
    {
      id: "e-sync-finalize",
      source: "sync",
      target: "finalize",
      type: "flow",
      style: { stroke: "#84cc16", strokeWidth: 1.8 },
    },
    {
      id: "e-finalize-a",
      source: "finalize",
      target: "payout-a",
      type: "flow",
      style: {
        stroke: "#84cc16",
        strokeDasharray: "5 7",
        strokeWidth: 1.8,
      },
    },
    {
      id: "e-finalize-b",
      source: "finalize",
      target: "payout-b",
      type: "flow",
      style: {
        stroke: "#84cc16",
        strokeDasharray: "5 7",
        strokeWidth: 1.8,
      },
    },
    {
      id: "e-finalize-c",
      source: "finalize",
      target: "payout-c",
      type: "flow",
      style: {
        stroke: "#84cc16",
        strokeDasharray: "5 7",
        strokeWidth: 1.8,
      },
    },
  ];

  return flowEdges.map(withState);
}

export function CampaignFlowSection() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % FLOW_NODE_ORDER.length);
    }, FLOW_STEP_MS);

    return () => window.clearInterval(interval);
  }, []);

  const activeNodeId = FLOW_NODE_ORDER[stepIndex];
  const nodes = useMemo(() => createNodes(activeNodeId), [activeNodeId]);
  const edges = useMemo(() => createEdges(activeNodeId), [activeNodeId]);

  return (
    <div className="hero-flow-wrap" aria-label="Campaign payout flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.02, duration: 350 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        className="campaign-flow-reactflow"
      />
    </div>
  );
}
