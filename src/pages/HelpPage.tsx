import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenIcon,
  FilterAlt as FilterIcon,
  PlayArrow as ActionIcon,
  Folder as FolderIcon,
  Code as CodeIcon,
  Lightbulb as TipIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { filterDefinitions, actionDefinitions } from '../utils/definitions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

const HelpPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleOpenDocs = async () => {
    await window.electronAPI.openExternal('https://organize.readthedocs.io/');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Help & Documentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how to use Organize Desktop effectively
        </Typography>
        <Button
          variant="contained"
          startIcon={<OpenIcon />}
          onClick={handleOpenDocs}
          sx={{ mt: 2 }}
        >
          Open Full Documentation
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Getting Started" />
          <Tab label="Filters" />
          <Tab label="Actions" />
          <Tab label="Placeholders" />
          <Tab label="Examples" />
        </Tabs>
      </Paper>

      {/* Getting Started */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Quick Start Guide
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">1. Understanding Rules</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    A <strong>rule</strong> is the basic building block of organize. Each rule consists of:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Locations"
                        secondary="Folders to search for files (e.g., ~/Downloads, ~/Desktop)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><FilterIcon color="secondary" /></ListItemIcon>
                      <ListItemText
                        primary="Filters"
                        secondary="Conditions that files must match (e.g., extension: pdf, size: > 1MB)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ActionIcon color="success" /></ListItemIcon>
                      <ListItemText
                        primary="Actions"
                        secondary="What to do with matching files (e.g., move, copy, delete)"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">2. Creating Your First Rule</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    Follow these steps to create a rule:
                  </Typography>
                  <ol>
                    <li>Go to the <strong>Visual Editor</strong> page</li>
                    <li>Click <strong>Add Rule</strong></li>
                    <li>Add locations where you want to search for files</li>
                    <li>Add filters to match specific files</li>
                    <li>Add actions to specify what to do with matched files</li>
                    <li>Save your configuration</li>
                  </ol>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">3. Simulating vs Running</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon />
                      <Typography variant="subtitle2">Important!</Typography>
                    </Box>
                    <Typography variant="body2">
                      Always simulate your rules before running them for the first time.
                    </Typography>
                  </Box>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Simulate"
                        secondary="Shows what would happen without actually modifying any files. Use this to test your rules safely."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Run"
                        secondary="Actually executes the actions on your files. Make sure you've tested with simulate first!"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">4. Tips & Best Practices</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><TipIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Start small"
                        secondary="Begin with a single folder and simple rules before scaling up"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TipIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Use descriptive names"
                        secondary="Name your rules clearly so you remember what they do"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TipIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Backup important files"
                        secondary="Always have backups before running rules on important data"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TipIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Use tags"
                        secondary="Tag your rules to run specific subsets with --tags flag"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Filters */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Available Filters
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Filters determine which files/folders a rule applies to. All filters must match (AND logic by default).
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Filter</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Files</strong></TableCell>
                  <TableCell><strong>Dirs</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterDefinitions.map((filter) => (
                  <TableRow key={filter.name}>
                    <TableCell>
                      <Chip label={filter.label} size="small" color="secondary" />
                    </TableCell>
                    <TableCell>{filter.description}</TableCell>
                    <TableCell>{filter.supportsFiles ? '✓' : '—'}</TableCell>
                    <TableCell>{filter.supportsDirs ? '✓' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Negating Filters
            </Typography>
            <Typography variant="body2">
              Prefix any filter with <code>not</code> to negate it. For example:
              <br />
              <code>not extension: pdf</code> matches files that are NOT PDFs
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Actions */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Available Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Actions determine what happens to matched files/folders. Actions are executed in order.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Files</strong></TableCell>
                  <TableCell><strong>Dirs</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionDefinitions.map((action) => (
                  <TableRow key={action.name}>
                    <TableCell>
                      <Chip label={action.label} size="small" color="success" />
                    </TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.supportsFiles ? '✓' : '—'}</TableCell>
                    <TableCell>{action.supportsDirs ? '✓' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Dangerous Actions
            </Typography>
            <Typography variant="body2">
              <strong>delete</strong> permanently removes files. <strong>trash</strong> moves them to the system trash.
              Always simulate first!
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Placeholders */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Template Placeholders
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use placeholders in action parameters to dynamically insert values.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Always Available
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><code>{'{path}'}</code></TableCell>
                      <TableCell>Full file path</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{relative_path}'}</code></TableCell>
                      <TableCell>Relative path from location</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{now()}'}</code></TableCell>
                      <TableCell>Current datetime</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{today()}'}</code></TableCell>
                      <TableCell>Current date</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{utcnow()}'}</code></TableCell>
                      <TableCell>Current UTC datetime</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{env.VAR}'}</code></TableCell>
                      <TableCell>Environment variable</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                From Filters
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><code>{'{extension}'}</code></TableCell>
                      <TableCell>File extension (from extension filter)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{name}'}</code></TableCell>
                      <TableCell>Filename stem (from name filter)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{size}'}</code></TableCell>
                      <TableCell>File size info (from size filter)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{created}'}</code></TableCell>
                      <TableCell>Creation date (from created filter)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{lastmodified}'}</code></TableCell>
                      <TableCell>Modified date (from lastmodified filter)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>{'{regex.group}'}</code></TableCell>
                      <TableCell>Captured regex group</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Python Expressions
            </Typography>
            <Typography variant="body2" component="div">
              You can use Python methods on placeholders:
              <ul>
                <li><code>{'{extension.upper()}'}</code> - uppercase extension</li>
                <li><code>{'{created.strftime("%Y-%m")}'}</code> - format date</li>
                <li><code>{'{name.replace(" ", "_")}'}</code> - replace spaces</li>
              </ul>
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Examples */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Sort Downloads by Extension
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Sort by extension"
    locations: ~/Downloads
    filters:
      - extension
    actions:
      - move: "~/Downloads/{extension.upper()}/""`}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Delete Empty Folders
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Delete empty folders"
    locations:
      - path: ~/Downloads
        max_depth: null
    targets: dirs
    filters:
      - empty
    actions:
      - delete`}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Sort Invoices by Month
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Sort invoices"
    locations: ~/Downloads
    filters:
      - extension: pdf
      - name:
          contains: Invoice
      - created
    actions:
      - move: "~/Documents/Invoices/{created.strftime('%Y-%m')}/"`}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Find Large Files
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Find large files"
    locations:
      - path: ~/Downloads
        max_depth: null
    filters:
      - size: "> 100 MB"
    actions:
      - echo: "{path} - {size.traditional}"`}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Find & Remove Duplicates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Remove duplicates"
    locations:
      - ~/Downloads
      - ~/Documents
    subfolders: true
    filters:
      - duplicate
    actions:
      - trash`}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Sort Photos by Date
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto',
                }}
              >
{`rules:
  - name: "Sort photos"
    locations: ~/Downloads
    filters:
      - extension:
          - jpg
          - jpeg
          - png
      - exif: image.datetime
    actions:
      - move: "~/Pictures/{exif.image.datetime.strftime('%Y/%m')}/"`}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default HelpPage;
