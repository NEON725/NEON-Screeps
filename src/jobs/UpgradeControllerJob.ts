import JobBase from "./JobBase";

export default class UpgradeControllerJob extends JobBase
{
	controllerId: Id<StructureController>;
	constructor(controller: StructureController)
	{
		super("UpgradeController", {maxAssigned: 12, atom: controller.id});
		this.controllerId = controller.id;
	}

	run(): boolean
	{
		const controller = Game.getObjectById(this.controllerId);
		return UpgradeControllerJob.isJobNeeded(controller);
	}

	static isJobNeeded(controller: StructureController | null)
	{
		return controller !== null && !controller.upgradeBlocked && (controller.level < 8 || controller.ticksToDowngrade < 5000);
	}
}