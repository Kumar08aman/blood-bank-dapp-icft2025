import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BloodBankModule = buildModule("BloodBankModule", (m) => {
  // The BloodBank constructor takes no arguments, so we deploy it directly.
  const bloodBank = m.contract("BloodBank");

  return { bloodBank };
});

export default BloodBankModule;