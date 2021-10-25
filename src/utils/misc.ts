import CreepRole from "roles/CreepRole";
import names from "utils/names.json";

export function deepEquals(a: any, b: any)
{
	if(Object.keys(a).length !== Object.keys(b).length)
	{
		return false
	}

	for(const key in a)
	{
		const aValue = a[key]
		const bValue = b[key]
		if((aValue instanceof Object && !deepEquals(aValue, bValue)) || (!(aValue instanceof Object) && aValue !== bValue))
		{
			return false
		}
	}
	return true
}

export function randomDirection(): DirectionConstant
{
	return (Math.floor(Math.random() * 8) + 1) as DirectionConstant;
}

export function generateID<T>(): Id<T>
{
	return ("xxxx-xxxx-xxx-xxxx".replace(/[x]/g, function(c)
	{
		/* eslint-disable no-bitwise */
		const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8);
		return v.toString(16);
		/* eslint-enable no-bitwise */
	})) as Id<T>;
}

export function generateRandomName(): string
{
	while(true)
	{
		const i = Math.floor(Math.random() * names.length);
		const retval = names[i];
		if(!Game.creeps[retval]){return retval;}
	}
}

export function isJobAssignable(ent: RoomObject)
{
	const a = ent as any;
	return ("name" in a) && ("memory" in a);
}

export function moveTo(
	self: Creep,
	target: RoomPosition | {pos: RoomPosition},
	extraOpts?: any
): CreepMoveReturnCode | -2 | -5 | -7
{
	if(self.fatigue > 0){return OK;}
	const pos = ("pos" in target) ? target.pos : target;
	const opts: any = {reusePath: 20, noPathFinding: true, ...(extraOpts || {})};
	let retVal = self.moveTo(pos, opts);
	if(retVal === ERR_NOT_FOUND || retVal === ERR_NO_PATH)
	{
		opts.noPathFinding = false;
		retVal = self.moveTo(pos, opts);
	}
	return retVal;
}