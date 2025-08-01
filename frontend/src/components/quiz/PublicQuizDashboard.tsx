"use client";

import { useState, useEffect } from 'react';
import { PageTitle, BodyText } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Trophy, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchWithAuth } from '@/lib/api';

// This is a placeholder for the full quiz data type
type QuizData = {
  id: string;
  title: string | null;
  description: string | null;
  isPublic: boolean;
};

type LeaderboardEntry = {
  nickname: string;
  score: number;
  time_taken_seconds: number;
};

interface PublicQuizDashboardProps {
  quizData: QuizData;
  leaderboard: LeaderboardEntry[];
}

export function PublicQuizDashboard({ quizData, leaderboard }: PublicQuizDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [sharableLink, setSharableLink] = useState('');
  const [currentLeaderboard, setCurrentLeaderboard] = useState<LeaderboardEntry[]>(leaderboard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSharableLink(`${window.location.origin}/quiz/${quizData.id}`);
    setCurrentLeaderboard(leaderboard);
  }, [quizData.id, leaderboard]);

  const handleCopy = () => {
    if (!sharableLink) return;
    navigator.clipboard.writeText(sharableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRefreshLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizData.id}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLeaderboard(data.data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <PageTitle>{quizData.title}</PageTitle>
          <BodyText>{quizData.description || 'This is your public quiz dashboard.'}</BodyText>
        </div>

        {/* Sharable Link Card */}
        <Card className="bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-lg">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Share Your Quiz</h2>
            <p className="text-sm text-[#A0A0A0]">
              Anyone with this link can take your quiz. Their results will appear on the leaderboard below.
            </p>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Input
              readOnly
              value={sharableLink}
              placeholder="Loading sharable link..."
              className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-gray-300"
            />
            <Button onClick={handleCopy} variant="outline" className="shrink-0" disabled={!sharableLink}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard Section */}
        <Card className="bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Leaderboard
                </h2>
                <p className="text-sm text-[#A0A0A0]">Top scores from players who have taken your quiz.</p>
              </div>
              <Button
                onClick={handleRefreshLeaderboard}
                disabled={isRefreshing}
                variant="outline"
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentLeaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#3A3A3A]">
                    <TableHead className="w-[60px] text-center">Rank</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLeaderboard.map((entry, index) => (
                    <TableRow key={index} className="border-b-0">
                      <TableCell className="text-center font-bold text-lg">
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-200">{entry.nickname}</TableCell>
                      <TableCell className="text-right font-semibold text-green-400">{Math.round(entry.score)}%</TableCell>
                      <TableCell className="text-right text-gray-400">{entry.time_taken_seconds}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No one has taken your quiz yet. Share the link above to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 