import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import type { Metadata } from 'next';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata: Metadata = {
  title: '수강생 관리',
  description: '영어학원 CRM - 학생, 출결, 테스트, 원비 관리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}
