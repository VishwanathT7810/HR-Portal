import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import cn from 'classnames'
import SearchBar from '../components/SearchBar'
import EmployeeTable from '../components/EmployeeTable'
import CreateInvitationButton from '../components/CreateInvitationButton'
import {
  listEmployees,
  searchEmployeesByMobile,
} from '../services/adminApi'
import type { EmployeeSummary } from '../types/admin.types'

function toast(message: string, variant: 'success' | 'error' = 'error'): void {
  const el = document.createElement('div')
  const bg =
    variant === 'success' ? 'var(--color-success)' : 'var(--color-error)'
  el.textContent = message
  Object.assign(el.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '9999',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#fff',
    backgroundColor: bg,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '320px',
  })
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

const PAGE_SIZE = 20

export default function EmployeesListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') || ''
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchMode, setSearchMode] = useState(false)
  const [searchResults, setSearchResults] = useState<EmployeeSummary[] | null>(
    null
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadPage = useCallback(async (p: number) => {
    try {
      setLoading(true)
      const list = await listEmployees(p, PAGE_SIZE)
      if (p === 1) {
        setRows(list)
      } else {
        setRows((prev) => [...prev, ...list])
      }
      setHasMore(list.length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
      toast('Failed to load employees', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPage(1)
  }, [loadPage])

  async function handleSearch(
    _values: { mobile: string },
    mobile: string
  ) {
    try {
      setSearchLoading(true)
      setSearchResults(null)
      setSearchMode(true)
      const results = await searchEmployeesByMobile(mobile)
      if (results.length === 1) {
        navigate(`/admin/employees/${results[0].submissionReference}`)
        return
      }
      setSearchResults(results)
    } catch (err) {
      console.error(err)
      toast('Search failed. Please try again.', 'error')
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (urlSearch) {
      void handleSearch({ mobile: urlSearch }, urlSearch)
    }
  }, [urlSearch])

  function clearSearch() {
    setSearchMode(false)
    setSearchResults(null)
    if (searchParams.get('search')) {
      setSearchParams({})
    }
  }

  function handleLoadMore() {
    const next = page + 1
    setPage(next)
    void loadPage(next)
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 lg:py-8">
        <header className="mb-5 sm:mb-6 lg:mb-8">
          <div className="mb-4 sm:mb-5">
            <div className="min-w-0">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-bold m-0 break-words"
                style={{ color: 'var(--color-text)' }}
              >
                All Employees
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Browse and search employee submissions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="w-full sm:max-w-xs">
              <SearchBar
                onSuccess={handleSearch}
                onClear={clearSearch}
                loading={searchLoading}
                defaultValue={urlSearch}
                placeholder="Search Mobile Number"
              />
            </div>
            {searchMode && (
              <div className="flex items-center gap-3">
                <p
                  className="text-xs sm:text-sm m-0"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {searchResults === null
                    ? 'Searching...'
                    : `Showing ${searchResults.length} search result${searchResults.length === 1 ? '' : 's'
                    }.`}
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  ✕ Clear search
                </button>
              </div>
            )}
          </div>
        </header>

        {searchMode ? (
          searchResults !== null ? (
            <EmployeeTable
              rows={searchResults}
              emptyMessage="No employees matched your search criteria."
            />
          ) : null
        ) : (
          <>
            <EmployeeTable
              rows={rows}
              loading={loading && page === 1}
              emptyMessage="No employee records exist yet. Create an invitation to get started."
            />
            {!loading && rows.length > 0 && (
              <div className="mt-4 sm:mt-5 flex justify-center">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className={cn(
                      'px-5 py-2.5 text-sm font-medium rounded-md transition-colors border',
                      'border-[var(--color-border)] bg-white hover:bg-[var(--color-surface)]',
                      loading ? 'opacity-60 cursor-not-allowed' : ''
                    )}
                    style={{ color: 'var(--color-text)' }}
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                ) : (
                  <p
                    className="text-sm px-4 py-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    You've reached the end of the list.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
