enum JobPriority
{ /* eslint-disable-line @typescript-eslint/indent */
	TIMESINK,
	EXPAND,
	MAINTAIN,
	DANGER,
	length,
}

export default JobPriority;

export function getJobPrioritiesSorted(): JobPriority[]
{
	const retVal: JobPriority[] = [];
	for(let i = JobPriority.length - 1; i >= 0; i--)
	{
		retVal.push(i as JobPriority);
	}
	return retVal;
}