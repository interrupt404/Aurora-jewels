export function Footer() {
    return (
      <footer className="border-t bg-neutral-50 py-8 text-sm text-neutral-600 mt-10">
        <div className="mx-auto max-w-7xl grid gap-8 px-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Explore</h3>
            <ul>
              <li>About Us</li>
              <li>FAQ</li>
            </ul>
          </div>
  
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Customer Service</h3>
            <ul>
              <li>Contact</li>
              <li>Returns</li>
              <li>Repairs</li>
            </ul>
          </div>
  
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Join Our Newsletter</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-grow rounded-l-md border border-neutral-300 px-3 py-2 focus:outline-none"
              />
              <button className="ml-2 rounded-r-md border-2 px-4 py-2 text-nuetral-800 hover:bg-gray-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Aurora Jewels — All rights reserved.
        </p>
      </footer>
    );
  }