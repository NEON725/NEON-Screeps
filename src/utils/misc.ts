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