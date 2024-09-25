'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Search, X, PlayCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Index() {
  const [word, setWord] = useState<string>('')
  const [volcab, setVolcab] = useState<any[]>([])
  const [wordPhonetic, setWordPhonetic] = useState<string>('')
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string>('')
  const [bookmarks, setBookmarks] = useState<string[]>([])

  const isBookmarked = bookmarks.includes(word)

  const handleClear = () => {
    setWord('')
    setVolcab([])
    setError('')
  }

  const updateState = (data: any[]) => {
    setVolcab(data)
    setWordPhonetic(data[0].phonetic)
    const phonetics = data[0].phonetics
    if (!phonetics.length) return null
    const phoneticWithAudio = phonetics.find((phonetic: { audio: HTMLAudioElement; }) => phonetic.audio);
    if (phoneticWithAudio && phoneticWithAudio.audio) {
      let url = phoneticWithAudio.audio;

      // Ensure the URL starts with https://
      if (!url.startsWith('https://')) {
        url = `https:${url}`;
      }
      setAudio(new Audio(url));
    }
  }

  const findVolcab = async () => {
    if (word) {
      try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        let volcabData = res.data
        if (volcabData) {
          updateState(volcabData)
        }
        setError('')
      } catch (error) {
        console.error(error, 'Not Found')
        setVolcab([])
        setError(`${word} not found`)
      }
    }
  }

  const addBookmark = (volcab: string, defi: any[]) => {
    setBookmarks(prevBookmark => [...prevBookmark, volcab])
  }

  const removeBookmark = (volcab: string) => {
    setBookmarks(prevBookmark => prevBookmark.filter((bookmark: string) => bookmark !== volcab))
  }

  useEffect(() => {
    console.log(bookmarks)
  },[bookmarks])

  return (
    <main className="flex-1 flex flex-col gap-6 px-4 items-center">
      <h1 className="font-bold text-4xl">FIND VOCABULARY</h1>
      <div className="flex gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="pl-8 pr-10"
          />
          {word && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={findVolcab}>Search</Button>
      </div>

      {volcab.length > 0 ?
        <div>
          <div className="flex items-center justify-between w-full mb-6">
            <div>
              <h1>{volcab[0].word}</h1>
              <p>{wordPhonetic}</p>
            </div>

            <div className="flex gap-2">
              {audio && <Button onClick={() => audio.play()}>
                <PlayCircle />
              </Button>}
              <Button onClick={() => isBookmarked ? removeBookmark(word) : addBookmark(word, volcab)}>
                {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
              </Button>
            </div>

          </div>
          <article>
            {volcab.map((def, index) => (
              <Card className="w-[345px] mb-4" key={index}>
                {def.meanings.map((meaning: any, idex: any) => (
                  <Fragment key={idex}>
                    <CardHeader>
                      <CardTitle>{meaning.partOfSpeech}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {meaning.definitions.map((defi: any, index: any) => (
                        <p key={index}>{meaning.definitions.length > 1 && `${index + 1}.`} {defi.definition}</p>
                      ))}
                      <p></p>
                    </CardContent>
                  </Fragment>
                ))}
              </Card>
            ))}
          </article>
        </div>
        :
        <div>
          {error === '' ? <h2 className="text-2xl font-bold">Search for a word to find its</h2> : <h2 className="text-2xl font-bold">{word} not found</h2>}
        </div>
      }

    </main>
  );
}
