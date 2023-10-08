// deploy/00_deploy_dapp.js
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    await deploy('Storage', {
        from: deployer,
        args: [343],
        log: true,
    });
};
module.exports.tags = ['Storage'];