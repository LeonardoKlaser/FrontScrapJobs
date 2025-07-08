import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button
        onClick={() => alert("sou gay")}
      >
        Clica no pai
      </Button>
    </div>
  )
}

export default App