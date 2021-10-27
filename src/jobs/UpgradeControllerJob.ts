import {log, LogLevel} from "utils/misc";
import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class UpgradeControllerJob extends JobBase
{
	controllerId: Id<StructureController>;
	constructor(controller: StructureController)
	{
		super("UpgradeController",
			{
				maxAssigned: 12,
				atom: controller.id,
				priority: JobPriority.EXPAND,
			});
		this.controllerId = controller.id;
	}

	run(): boolean
	{
		const controller = Game.getObjectById(this.controllerId) as StructureController;
		if(controller.ticksToDowngrade <= 3000)
		{
			log(LogLevel.DANGER, "LOSTCONTROL", `Controller in ${controller.room.name} is decaying!`);
			this.priority = JobPriority.DANGER;
		}
		else{this.priority = JobPriority.EXPAND;}
		return UpgradeControllerJob.isJobNeeded(controller);
	}

	static isJobNeeded(controller: StructureController | null)
	{
		return controller !== null && !controller.upgradeBlocked && (controller.level < 8 || controller.ticksToDowngrade < 5000);
	}

	toString(): string
	{
		const structure = Game.getObjectById(this.controllerId) as StructureController;
		return `${super.toString()}:${structure?.room?.name || "???"}`;
	}
}