import { Code } from '@/components/code-component';

export default function TestPage() {
  const codeBody = 'export default function Teste(){}';

  return <Code code={{ language: 'javascript', body: codeBody }} />;
}
