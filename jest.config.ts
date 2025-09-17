import type {Config} from "jest";

const config: Config = 
{
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    modulePaths: ["./src/"]
};

export default config;