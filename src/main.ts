import { ErrorMapper } from "utils/ErrorMapper";
import RoleIndex from "roles/roleIndex";
import CreepRole from "types/CreepRole";
import names from "utils/names.json";

declare global
{
	interface CreepMemory
	{
		role:string;
	}
}

const roleIndex = new RoleIndex();

function generateRandomName():string
{
	const i =Math.floor(Math.random() * names.length);
	const retval= names[i];
	return retval;
}

function spawnCreep(spawn:StructureSpawn, role:CreepRole)
{
	console.log("SPAWN");
	spawn.spawnCreep([WORK,CARRY,MOVE], generateRandomName(), {memory: role.initMemory()})
}

export const loop = ErrorMapper.wrapLoop(() =>
{
	for (const name in Memory.creeps)
	{
		if (!(name in Game.creeps))
		{
			delete Memory.creeps[name];
			continue;
		}
		const creep = Game.creeps[name];
		const memory = creep.memory;
		const role = roleIndex.getRole(memory.role);
		const temp=memory as any;
		temp.test=names;
		role.run(creep);
	}
	const spawn = Game.spawns.Spawn1;
	if(spawn.store.energy >= 200)
	{
		spawnCreep(spawn,roleIndex.getRole("worker"));
	}
});