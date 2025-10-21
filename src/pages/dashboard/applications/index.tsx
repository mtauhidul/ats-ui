export default function ApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900">Applications</h2>
                <p className="text-gray-500 mt-2">Application tracking content will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}