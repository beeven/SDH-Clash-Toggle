import {
  ButtonItem,
  definePlugin,
  //DialogButton,
  //Menu,
  //MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  Toggle,
  ToggleField,
  //showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { VFC, useState } from "react";
import { FaShip } from "react-icons/fa";

//import logo from "../assets/logo.png";

interface ToggleProfileArgs {
  use_ebpf: boolean;
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  const [clashRunning, setClashRunning] = useState<boolean>(false);
  const [clashUseEbpf, setClashUseEbpf] = useState<boolean>(false);

  serverAPI.callPluginMethod<any, boolean>("is_clash_running", {}).then((r) => {
    if (r.success) { setClashRunning(r.result) }
  });
  serverAPI.callPluginMethod<any, boolean>("is_using_ebpf", {}).then((r) => {
    if (r.success) { setClashUseEbpf(r.result) }
  })

  const toggleUseEbpf = async(e: boolean) =>{
    let result = await serverAPI.callPluginMethod<ToggleProfileArgs, boolean>("toggle_profile", { use_ebpf: e})
    if(result.success) {
      setClashRunning(result.result);
    }
    setClashUseEbpf(e);
  }
  const toggleClash = async(e: boolean) => {
    let result = await serverAPI.callPluginMethod<any,boolean>("is_clash_running",{});
    if(result.success)
    {
      if(result.result != e) {
        if(result.result) {
          await serverAPI.callPluginMethod<any,boolean>("stop_clash",{});
          setClashRunning(false);
        }
        else
        {
          await serverAPI.callPluginMethod<any,boolean>("start_clash",{});
          setClashRunning(true);
        }
      }
    }
  }


  return (
    <PanelSection title="Panel Section">
      
      <PanelSectionRow>
          <ToggleField
            label={`Clash is ${clashRunning ? 'running' : 'stopped'}`}
            checked={clashRunning}
            onChange={(e) => toggleClash(e)}
          />
      </PanelSectionRow>
     
      <PanelSectionRow>
          <ToggleField
            label={`Use ebpf: ${clashUseEbpf ? 'true' : 'false'}`}
            checked={clashUseEbpf}
            onChange={(e) => toggleUseEbpf(e)}
          />
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.NavigateToExternalWeb("http://127.0.0.1:9090/ui/")
          }}
        >
          Clash UI
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};





export default definePlugin((serverApi: ServerAPI) => {
  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });

  return {
    title: <div className={staticClasses.Title}>ClashToggle</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      //serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
