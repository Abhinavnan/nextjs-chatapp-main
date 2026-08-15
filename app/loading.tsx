const Loading = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-2 min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-500">Loading page</p>
      </div>
    </div>
  )
}

export default Loading;
