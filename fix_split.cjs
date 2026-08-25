const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{activeView === 'split' && \([\s\S]*?<\/div>\n\s*\)\}/;

const replacement = `{activeView === 'split' && (
          <DualPaneWorkspace 
            leftTitle="Meow Reader"
            leftIcon={<BookOpen className="w-4 h-4 text-amber-400" />}
            leftContent={
              <ReaderView
                book={activeBook}
                currentChapterIndex={currentChapterIndex}
                currentParagraphIndex={currentParagraphIndex}
                activeTargetCfi={activeTargetCfi}
                readerTheme={readerTheme}
                fontSize={fontSize}
                onChapterChange={(idx) => {
                  setCurrentChapterIndex(idx);
                  setCurrentParagraphIndex(0);
                }}
                onParagraphSelect={(idx) => setCurrentParagraphIndex(idx)}
                onOpenQuickCapture={handleOpenQuickCapture}
                onOpenAcquisitionModal={() => setIsAcquisitionModalOpen(true)}
                onThemeChange={setReaderTheme}
                onFontSizeChange={(delta) => setFontSize(prev => Math.min(24, Math.max(12, prev + delta)))}
              />
            }
            rightTitle="Sidecar .md"
            rightIcon={<FileText className="w-4 h-4 text-amber-400" />}
            rightContent={
              <div className="flex flex-col gap-6 h-full">
                <div className="flex-1 min-h-[300px]">
                  <ResonanceStreamView
                    entries={activeBook?.resonanceStream || []}
                    onDeepLinkJump={handleDeepLinkJump}
                    onDeleteEntry={handleDeleteEntry}
                    onOpenQuickCapture={() => handleOpenQuickCapture()}
                    onOpenShareModal={(entry) => {
                      setShareTargetEntry(entry);
                      setIsShareModalOpen(true);
                    }}
                  />
                </div>
                <div className="flex-1 min-h-[300px]">
                  <SidecarEditor
                    markdownContent={activeBook?.sidecarMarkdown || ''}
                    bookTitle={activeBook?.title || 'Sidecar Editor'}
                    onUpdateMarkdown={(newMd) => {
                      handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, sidecarMarkdown: newMd } : b));
                    }}
                  />
                </div>
              </div>
            }
          />
        )}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Successfully replaced split view!");
} else {
  console.log("Could not find split view block.");
}
