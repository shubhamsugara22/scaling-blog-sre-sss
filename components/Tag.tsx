function Tag({ label }: { label: string }) {
	return (
		<span className="text-xs px-2 py-1 rounded-full border flex justify-center items-center" role="listitem">
			{label}
		</span>
	);
}

export default Tag;