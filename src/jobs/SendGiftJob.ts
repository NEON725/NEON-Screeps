import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class SendGiftJob extends JobBase
{
	constructor(public roomName: string)
	{
		super("SendGift",
			{
				maxAssigned: 1,
				atom: roomName,
				priority: JobPriority.TIMESINK,
			});
	}

	run(): boolean
	{
		return true;
	}
}