import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import {
  ReactRenderPlugin,
  Presets,
  ReactArea2D
} from "rete-react-render-plugin";
import { DockPlugin, DockPresets } from "rete-dock-plugin";

type Nodes = NodeA | NodeB;

type Schemes = GetSchemes<Nodes, Connection<Nodes>>;
type AreaExtra = ReactArea2D<any>;

class Connection<N extends Nodes> extends ClassicPreset.Connection<N, N> {}

class NodeA extends ClassicPreset.Node {
  constructor(socket: ClassicPreset.Socket) {
    super("A");
    this.addControl("a", new ClassicPreset.InputControl("text", {}));
    this.addOutput("a", new ClassicPreset.Output(socket));

    return this;
  }
}

class NodeB extends ClassicPreset.Node {
  constructor(socket: ClassicPreset.Socket) {
    super("B");
    this.addControl("b", new ClassicPreset.InputControl("text", {}));
    this.addInput("b", new ClassicPreset.Input(socket));

    return this;
  }
}

export async function createEditor(container: HTMLElement) {
  const socket = new ClassicPreset.Socket("socket");

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactRenderPlugin<Schemes, AreaExtra>({ createRoot });
  const dock = new DockPlugin<Schemes>();

  dock.addPreset(DockPresets.classic.setup({ area, size: 100, scale: 0.6 }));

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });

  render.addPreset(Presets.classic.setup());

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(dock);

  dock.add(() => new NodeA(socket));
  dock.add(() => new NodeB(socket));

  AreaExtensions.simpleNodesOrder(area);

  const a = new NodeA(socket);
  await editor.addNode(a);

  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy()
  };
}
