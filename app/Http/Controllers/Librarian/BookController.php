<?php

namespace App\Http\Controllers\Librarian;

use App\Http\Controllers\Controller;
use App\Models\LibraryBook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = LibraryBook::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('availability') && $request->availability !== 'all') {
            if ($request->availability === 'available') {
                $query->where('available_quantity', '>', 0);
            } else {
                $query->where('available_quantity', '<=', 0);
            }
        }

        $books = $query->orderBy('title')->paginate(25)->withQueryString();

        $categories = LibraryBook::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('librarian/books/index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'availability' => $request->availability,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'isbn' => 'nullable|string|max:20|unique:library_books,isbn',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'category' => 'nullable|string|max:100',
            'shelf_location' => 'nullable|string|max:50',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        $validated['available_quantity'] = $validated['quantity'];
        $validated['is_available'] = true;

        LibraryBook::create($validated);

        return back()->with('success', 'Book added successfully.');
    }

    public function update(Request $request, LibraryBook $book)
    {
        $validated = $request->validate([
            'isbn' => 'nullable|string|max:20|unique:library_books,isbn,' . $book->id,
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'category' => 'nullable|string|max:100',
            'shelf_location' => 'nullable|string|max:50',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        // Adjust available quantity based on quantity change
        $quantityDiff = $validated['quantity'] - $book->quantity;
        $validated['available_quantity'] = max(0, $book->available_quantity + $quantityDiff);
        $validated['is_available'] = $validated['available_quantity'] > 0;

        $book->update($validated);

        return back()->with('success', 'Book updated successfully.');
    }

    public function destroy(LibraryBook $book)
    {
        $book->delete();
        return back()->with('success', 'Book deleted successfully.');
    }
}
