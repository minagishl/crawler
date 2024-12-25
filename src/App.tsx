import React, { useState } from 'react';
import { Send } from 'lucide-react';

function App() {
	const [text, setText] = useState('');
	const [webhookUrl, setWebhookUrl] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [status, setStatus] = useState('');

	const sendToDiscord = async (content: string) => {
		try {
			const response = await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			return true;
		} catch (error) {
			console.error('Error sending message:', error);
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || !webhookUrl.trim()) {
			setStatus('Please enter both text and webhook URL');
			return;
		}

		setIsSending(true);
		setStatus('Sending messages...');

		// Split text into lines and group by 5
		const lines = text.split('\n').filter((line) => line.trim());
		const groups = [];

		for (let i = 0; i < lines.length; i += 5) {
			groups.push(lines.slice(i, i + 5).join('\n'));
		}

		// Send each group
		for (const group of groups) {
			const success = await sendToDiscord(group);
			if (!success) {
				setStatus('Error sending messages');
				setIsSending(false);
				return;
			}
			// Discord rate limit prevention
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		setStatus('Messages sent successfully!');
		setIsSending(false);
	};

	return (
		<div className='min-h-screen bg-gray-100 p-8'>
			<div className='max-w-2xl mx-auto'>
				<div className='bg-white rounded-lg shadow-md p-6'>
					<h1 className='text-2xl font-bold mb-6'>Discord Message Sender</h1>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label htmlFor='webhook' className='block text-sm font-medium text-gray-700 mb-1'>
								Discord Webhook URL
							</label>
							<input
								id='webhook'
								type='url'
								value={webhookUrl}
								onChange={(e) => setWebhookUrl(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
								placeholder='https://discord.com/api/webhooks/...'
								required
							/>
						</div>

						<div>
							<label htmlFor='text' className='block text-sm font-medium text-gray-700 mb-1'>
								Text (will be grouped every 5 lines)
							</label>
							<textarea
								id='text'
								value={text}
								onChange={(e) => setText(e.target.value)}
								className='w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
								placeholder='Enter your text here...'
								required
							/>
						</div>

						<button
							type='submit'
							disabled={isSending}
							className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
						>
							<Send size={20} />
							{isSending ? 'Sending...' : 'Send to Discord'}
						</button>
					</form>

					{status && (
						<div
							className={`mt-4 p-3 rounded-md ${
								status.includes('Error')
									? 'bg-red-100 text-red-700'
									: status.includes('success')
									? 'bg-green-100 text-green-700'
									: 'bg-blue-100 text-blue-700'
							}`}
						>
							{status}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
