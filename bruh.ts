import { exec, spawn, execFile } from "child_process";
import { basename } from "path";

const path =
  "C:\\Users\\Waadl\\Documents\\aadildev\\projects\\electron-youtube-download-trimmer\\yt-trimmer\\src\\binaries\\yt-dlp.exe";

const url = "https://www.youtube.com/watch?v=_Td7JjCTfyc";

class CLI {
  static linux(
    command: string,
    options?: {
      cwd?: string;
      loud?: boolean;
    }
  ) {
    // send back stderr and stdout
    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        shell: "bash",
        cwd: options?.cwd,
      });
      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        options?.loud && console.log(data.toString());
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        options?.loud && console.log(data.toString());
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  static cmd(
    filepath: string,
    commands: string[],
    options?: {
      cwd?: string;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        filepath,
        commands,
        {
          maxBuffer: 500 * 1_000_000,
          ...options,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(`Error executing ${basename(filepath)}:`, error);
            reject(stderr);
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }
}

async function run() {
  try {
    // const result = await CLI.linux(`'${path}' ${url}`, {
    //   loud: true,
    // });
    const result = await CLI.cmd(path, ["--force-overwrites", url]);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

run();

// exec(`'${path}' ${url}`, { shell: "bash" }, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error: ${error.message}`);
//   }
//   if (stdout) {
//     console.log(`stdout: ${stdout}`);
//   }
// });
