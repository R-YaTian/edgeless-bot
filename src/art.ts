import { config } from "./config";

export default function () {
  console.clear();
  if (config.GITHUB_ACTIONS) {
    return;
  }
  console.log(
    " /$$$$$$$$       /$$                     /$$                                    /$$$$$$$              /$$    \n" +
      "| $$_____/      | $$                    | $$                                   | $$__  $$            | $$    \n" +
      "| $$        /$$$$$$$  /$$$$$$   /$$$$$$ | $$  /$$$$$$   /$$$$$$$ /$$$$$$$      | $$  \\ $$  /$$$$$$  /$$$$$$  \n" +
      "| $$$$$    /$$__  $$ /$$__  $$ /$$__  $$| $$ /$$__  $$ /$$_____//$$_____/      | $$$$$$$  /$$__  $$|_  $$_/  \n" +
      "| $$__/   | $$  | $$| $$  \\ $$| $$$$$$$$| $$| $$$$$$$$|  $$$$$$|  $$$$$$       | $$__  $$| $$  \\ $$  | $$    \n" +
      "| $$      | $$  | $$| $$  | $$| $$_____/| $$| $$_____/ \\____  $$\\____  $$      | $$  \\ $$| $$  | $$  | $$ /$$\n" +
      "| $$$$$$$$|  $$$$$$$|  $$$$$$$|  $$$$$$$| $$|  $$$$$$$ /$$$$$$$//$$$$$$$/      | $$$$$$$/|  $$$$$$/  |  $$$$/\n" +
      "|________/ \\_______/ \\____  $$ \\_______/|__/ \\_______/|_______/|_______/       |_______/  \\______/    \\___/  \n" +
      "                     /$$  \\ $$                                                                               \n" +
      "                    |  $$$$$$/                                                                               \n" +
      "                     \\______/                                                                                "
  );
}
