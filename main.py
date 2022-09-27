import logging
import asyncio

logging.basicConfig(filename="/tmp/template.log",
                    format='[Template] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        logger.info(f"Calling add, params: {left} {right}")
        return left + right

    async def toggle_clash(self, turn_on):
        logger.info("Calling toggleClash")
        await asyncio.sleep(2)
        logger.info("ToggleClash finished.")
        return turn_on

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
        pass
