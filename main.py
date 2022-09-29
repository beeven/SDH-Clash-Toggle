import logging
import shutil
import subprocess

logging.basicConfig(filename="/tmp/clash-toggle-plugin.log",
                    format='[Template] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)

    async def toggle_profile(self, use_ebpf: bool):
        logger.info("Toggling profile...")
        if use_ebpf:
            shutil.copy("/home/deck/.config/clash/clash.ebpf.yaml","/home/deck/.config/clash/clash.yaml")
        else:
            shutil.copy("/home/deck/.config/clash/clash.http.yaml","/home/deck/.config/clash/clash.yaml")
        if await self.is_clash_running():
            await self.start_clash()
            return True
        return False
    
    async def is_using_ebpf(self):
        logger.info("Checking is using ebpf.")
        with open("/home/deck/.config/clash/clash.yaml", "r") as f:
            for line in f:
                if line.startswith("ebpf:"):
                    logger.info("Clash is using ebpf.")
                    return True
        logger.info("Clash is NOT using ebpf.")
        return False

    async def is_clash_running(self):
        logger.info("Checking is clash running...")
        p = subprocess.run(["pgrep","-c","clash"], capture_output=True)
        if int(p.stdout.strip()) > 0:
            logger.info("Clash is running.")
            return True
        logger.info("Clash is NOT running.")
        return False

    
    async def start_clash(self):
        subprocess.run(["systemctl","stop","sysmted-resolved"])
        subprocess.run(["systemctl","restart","clash"])
        subprocess.run(["systemctl","restart","systemd-resolved"])

    async def stop_clash(self):
        subprocess.run(["systemctl","stop","clash"])
        subprocess.run(["systemctl","restart","systemd-resolved"])


    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
        pass



