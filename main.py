import logging
import shutil
import os
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

        is_clash_running = False

        p = subprocess.run(["pgrep","-c","clash"], capture_output=True)
        if int(p.stdout.strip()) > 0:
            is_clash_running = True
        if is_clash_running:
            logger.info("toggle_profile: clash is already runing, restarting...")
            if use_ebpf:
                shutil.copy("/etc/NetworkManager/conf.d/dns.no-systemd.conf.bak","/etc/NetworkManager/conf.d/dns.conf")
                subprocess.run(["nmcli","general","reload"])
                shutil.copy("/etc/resolv.114.conf.bak","/etc/resolv.conf")
            else:
                shutil.copy("/etc/NetworkManager/conf.d/dns.systemd.conf.bak","/etc/NetworkManager/conf.d/dns.conf")
                subprocess.run(["nmcli","general","reload"])
            subprocess.run(["systemctl","restart","clash"])
            return True
        return False
    
    async def is_using_ebpf(self):
        logger.info("Checking is using ebpf.")
        with open("/home/deck/.config/clash/clash.yaml", "r") as f:
            for line in f:
                if line.startswith("ebpf:"):
                    return True
        return False

    async def is_clash_running(self):
        logger.info("Checking is clash running...")
        p = subprocess.run(["pgrep","-c","clash"], capture_output=True)
        if int(p.stdout.strip()) > 0:
            return True
        return False
    
    async def start_clash(self):
        logger.info("Starting clash")
        is_using_ebpf = False
        with open("/home/deck/.config/clash/clash.yaml", "r") as f:
            for line in f:
                if line.startswith("ebpf:"):
                    is_using_ebpf = True
                    break
        logger.info("start_clash: is_using_ebpf: %s",is_using_ebpf)
        if is_using_ebpf:
            shutil.copy("/etc/NetworkManager/conf.d/dns.no-systemd.conf.bak","/etc/NetworkManager/conf.d/dns.conf")
            subprocess.run(["nmcli","general","reload"])
            shutil.copy("/etc/resolv.114.conf.bak","/etc/resolv.conf")
        else:
            shutil.copy("/etc/NetworkManager/conf.d/dns.systemd.conf.bak","/etc/NetworkManager/conf.d/dns.conf")
            subprocess.run(["nmcli","general","reload"])
        subprocess.run(["systemctl","restart","clash"])

    async def stop_clash(self):
        logger.info("Stopping clash")
        shutil.copy("/etc/NetworkManager/conf.d/dns.systemd.conf.bak","/etc/NetworkManager/conf.d/dns.conf")
        subprocess.run(["nmcli","general","reload"])
        shutil.copy("/etc/resolv.127.conf.bak","/etc/resolv.conf")
        subprocess.run(["systemctl","restart","systemd-resolved"])
        subprocess.run(["systemctl","stop","clash"])


    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
        pass



