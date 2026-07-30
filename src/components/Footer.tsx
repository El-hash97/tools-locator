export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Tools Locator. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
