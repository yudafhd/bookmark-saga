import { createContext, useContext } from "react";

interface BookmarkSagaContextType {
    state: {},
    action: {}
}

export const BookmarkSagaContext = createContext<BookmarkSagaContextType>({
    state: {},
    action: {},
});


export default function useBookmarkSagaContext() {
    const context = useContext(BookmarkSagaContext);
    if (!context) {
        throw new Error("useBookmarkSagaContext must be used within a BookmarkSagaProvider");
    }
    return context;
}

export function BookmarkSagaProvider({ children }: { children: React.ReactNode }) {
    const state = {};
    const action = {};
    return (
        <BookmarkSagaContext.Provider value={{ state, action }}>
            {children}
        </BookmarkSagaContext.Provider>
    )
}
