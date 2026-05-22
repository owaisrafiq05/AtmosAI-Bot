import { createApp } from "../dist/app";
import { validateEnv } from "../dist/config/env";

validateEnv();

export default createApp();
