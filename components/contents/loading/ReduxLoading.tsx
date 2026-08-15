const ReduxLoading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        {/* Animated Spinner Wheel */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-500">Loading page</p>
      </div>
    </div>
  )
}

export default ReduxLoading;
