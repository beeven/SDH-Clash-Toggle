import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  Toggle,
  showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { VFC, useState } from "react";
import { FaShip } from "react-icons/fa";

import logo from "../assets/logo.png";

interface AddMethodArgs {
  left: number;
  right: number;
}
interface ToggleClashArgs {
  turn_on: boolean;
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [result, setResult] = useState<number | undefined>();
  const [status, setStatus] = useState("Unchecked");
  const [checked, setChecked] = useState(false);
  const onCheckChanged = async (e: boolean) => {
    //setChecked(e);
    setStatus(`Param: ${e}. Waiting for server...`);

    const result = await serverAPI.callPluginMethod<ToggleClashArgs, boolean>(
      "toggle_clash", { turn_on: true }
    );
    if (result.success) {
      setChecked(result.result);
      setStatus(`Result: ${result.result}`);
    }
    else {
      setStatus(result.result);
    }
  };



  const add = async () => {
    const result = await serverAPI.callPluginMethod<AddMethodArgs,number>(
      "add",
      {
        left: 2,
        right: 2,
      }
    );
    if (result.success) {
      setResult(result.result);
    }
  };

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
                <MenuItem onSelected={() => { }}>Item #1</MenuItem>
                <MenuItem onSelected={() => { }}>Item #2</MenuItem>
                <MenuItem onSelected={() => { }}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <div>
          <Toggle
            value={checked}
            onChange={(e) => onCheckChanged(e)}
          />
        </div>
        <div>
          {status}
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below"
          onClick={() => {
            add();
          }}>
          Add
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>ClashToggle</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
