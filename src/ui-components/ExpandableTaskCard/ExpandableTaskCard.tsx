"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Hourglass, MoreHorizontal, Check, ChevronDown } from 'lucide-react';
import styles from './ExpandableTaskCard.module.css';

export interface Avatar {
  id: string | number;
  name: string;
  url: string;
}

export interface ChecklistItem {
  id: string | number;
  text: string;
  checked: boolean;
}

export interface ExpandableTaskCardProps {
  title?: string;
  progress?: number;
  avatars?: Avatar[];
  checklist?: ChecklistItem[];
  priority?: string;
  status?: string;
}

const defaultAvatars: Avatar[] = [
  { id: 1, name: 'Alex', url: 'https://i.pravatar.cc/150?img=12' },
  { id: 2, name: 'Sarah', url: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Mike', url: 'https://i.pravatar.cc/150?img=33' },
];

const defaultChecklist: ChecklistItem[] = [
  { id: 1, text: 'Database Schema', checked: true },
  { id: 2, text: 'API Routes', checked: true },
  { id: 3, text: 'Authentication', checked: false },
  { id: 4, text: 'Deployment', checked: false },
];

const ease = [0.4, 0, 0.2, 1] as const;

const HexagonIcon = () => (
  <div className={styles.iconWrapper}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  </div>
);

const CheckCircleSolid = () => (
  <div className={styles.checkCircleSolid}>
    <Check size={12} strokeWidth={3} />
  </div>
);

const CircleOutline = () => (
  <div className={styles.circleOutline} />
);

const ExpandableTaskCard: React.FC<ExpandableTaskCardProps> = ({
  title = 'System Design',
  progress = 50,
  avatars = defaultAvatars,
  checklist = defaultChecklist,
  priority = 'High',
  status = 'Review',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const completedCount = checklist.filter(item => item.checked).length;
  const totalCount = checklist.length;

  return (
    <div className={styles.container}>
      <div
        className={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ─── Header ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <HexagonIcon />
            <span className={styles.title}>{title}</span>
          </div>

          {/* Crossfade: progress bar ↔ "..." button */}
          <div className={styles.headerRight}>
            <motion.div
              className={styles.headerRightCollapsed}
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.2, ease }}
            >
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </motion.div>

            <motion.div
              className={styles.headerRightExpanded}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2, ease }}
            >
              <MoreHorizontal size={18} className={styles.iconGray} />
            </motion.div>
          </div>
        </div>

        {/* ─── Expandable body ─── */}
        <AnimatePresence initial={false}>
          {isHovered ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.35, ease },
                opacity: { duration: 0.25, ease },
              }}
              className={styles.expandedContent}
            >
              <div className={styles.expandedInner}>
                {/* Checklist header */}
                <motion.div
                  className={styles.checklistHeader}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.28, ease }}
                >
                  <div className={styles.checklistHeaderLeft}>
                    <CheckCircleSolid />
                    <span className={styles.checklistHeaderText}>{completedCount} of {totalCount}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={styles.progressText}>{progress}%</span>
                </motion.div>

                {/* Checklist items */}
                <div className={styles.checklistItemsWrapper}>
                  <motion.div
                    className={styles.treeLine}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease }}
                    style={{ transformOrigin: 'top' }}
                  />
                  <div className={styles.checklistItems}>
                    {checklist.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className={styles.checklistItem}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.045, duration: 0.28, ease }}
                      >
                        <div className={styles.treeConnector} />
                        {item.checked ? <CheckCircleSolid /> : <CircleOutline />}
                        <span className={item.checked ? styles.itemTextChecked : styles.itemText}>{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Priority & Status */}
                <motion.div
                  className={styles.metaInfoContainer}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.28, ease }}
                >
                  <div className={styles.metaRow}>
                    <div className={styles.metaLabel}><Flag size={14} className={styles.iconGray} strokeWidth={2.5} /> Priority</div>
                    <div className={styles.badgeRed}>{priority} <ChevronDown size={14} /></div>
                  </div>
                  <div className={styles.metaRow}>
                    <div className={styles.metaLabel}><Hourglass size={14} className={styles.iconGray} strokeWidth={2.5} /> Status</div>
                    <div className={styles.badgeYellow}>{status} <ChevronDown size={14} /></div>
                  </div>
                </motion.div>

                {/* Avatar pills */}
                <div className={styles.avatarsExpanded}>
                  {avatars.map((av, index) => (
                    <motion.div
                      key={av.id}
                      className={styles.avatarPill}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26 + index * 0.05, duration: 0.28, ease }}
                    >
                      <img src={av.url} alt={av.name} className={styles.avatarImg} />
                      <span>{av.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.35, ease },
                opacity: { duration: 0.25, ease },
              }}
              className={styles.footerCollapsed}
            >
              <div className={styles.footerInner}>
                <div className={styles.footerLeft}>
                  <Flag size={14} className={styles.iconGray} strokeWidth={2.5} /> <span className={styles.footerText}>{priority}</span>
                  <Hourglass size={14} className={styles.iconGray} strokeWidth={2.5} style={{ marginLeft: '8px' }} /> <span className={styles.footerText}>{status}</span>
                </div>
                <div className={styles.footerRight}>
                  {avatars.map((av, index) => (
                    <img
                      key={av.id}
                      src={av.url}
                      alt={av.name}
                      className={styles.avatarImgStacked}
                      style={{ zIndex: avatars.length - index, marginLeft: index === 0 ? 0 : '-8px' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpandableTaskCard;
