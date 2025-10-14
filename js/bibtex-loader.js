/**
 * BibTeX Parser and Display for Academic Website
 * This script loads publications from a BibTeX file and displays them in a tabbed interface
 */

// Function to load BibTeX file
async function loadBibTeX() {
  try {
    const response = await fetch('data/publications.bib');
    if (!response.ok) {
      throw new Error('Failed to load BibTeX file');
    }
    
    const text = await response.text();
    const publications = parseBibTeX(text);
    displayPublications(publications);
  } catch (error) {
    console.error('Error loading BibTeX file:', error);
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.innerHTML = '<p>Error loading publications. Please check your BibTeX file.</p>';
    });
  }
}

// Parse BibTeX string into structured data
function parseBibTeX(bibtexStr) {
  const publications = {
    inPreparation: [],
    submitted: [],
    published: []
  };
  
  // Regular expression for BibTeX entries
  // This handles multi-line fields and various entry types
  const entryRegex = /@(\w+)\s*{\s*([^,]*),\s*([\s\S]*?)\s*}\s*(?=@|\s*$)/g;
  
  let match;
  while ((match = entryRegex.exec(bibtexStr)) !== null) {
    const entryType = match[1].toLowerCase();
    const citeKey = match[2].trim();
    const fieldsText = match[3];
    
    // Skip non-publication entry types
    if (!['article', 'inproceedings', 'book', 'incollection', 'misc', 'unpublished'].includes(entryType)) {
      continue;
    }
    
    // Parse fields
    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*{([^{}]*(({[^{}]*})[^{}]*)*)}/g;
    let fieldMatch;
    
    while ((fieldMatch = fieldRegex.exec(fieldsText)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase();
      let fieldValue = fieldMatch[2].trim();
      
      // Clean up the field value (handle special characters, etc.)
      fieldValue = fieldValue.replace(/[{}]/g, '');
      fields[fieldName] = fieldValue;
    }
    
    // Alternative regex for quoted values
    const quotedFieldRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    while ((fieldMatch = quotedFieldRegex.exec(fieldsText)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase();
      let fieldValue = fieldMatch[2].trim();
      fields[fieldName] = fieldValue;
    }
    
    // Add citekey and type to fields
    fields.citekey = citeKey;
    fields.entrytype = entryType;
    
    // Categorize based on custom notes or entry type
    let category = 'published';
    
    if (fields.note) {
      if (fields.note.toLowerCase().includes('in preparation') || 
          fields.note.toLowerCase().includes('prep')) {
        category = 'inPreparation';
      } else if (fields.note.toLowerCase().includes('submitted') || 
                fields.note.toLowerCase().includes('submit')) {
        category = 'submitted';
      }
    }
    
    // Unpublished entries are considered either in preparation or submitted
    if (entryType === 'unpublished') {
      category = fields.note && fields.note.toLowerCase().includes('submit') ? 
                'submitted' : 'inPreparation';
    }
    
    // Add to the appropriate category
    publications[category].push(fields);
  }
  
  // Sort by year (descending)
  for (const category in publications) {
    publications[category].sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });
  }
  
  return publications;
}

// Format author names for display, highlighting your name
function formatAuthors(authorStr) {
  if (!authorStr) return '';
  
  // Split authors by "and" (common in BibTeX)
  const authors = authorStr.split(' and ');
  let result = '';
  
  authors.forEach((author, index) => {
    // Highlight your name
    if (author.includes('Verma')) {
      author = author.replace(/Verma, D/, '<strong>Verma, D</strong>');
      author = author.replace(/D[\.]{0,1} Verma/, '<strong>D. Verma</strong>');
      author = author.replace(/Deepanshu Verma/, '<strong>Deepanshu Verma</strong>');
    }
    
    // Add appropriate separators
    if (index === authors.length - 1) {
      result += author;
    } else if (index === authors.length - 2) {
      result += author + ' and ';
    } else {
      result += author + ', ';
    }
  });
  
  return result;
}

// Display publications on the page
function displayPublications(publications) {
  // Display in preparation publications
  let prepHtml = '<ul class="publications-list">';
  if (publications.inPreparation.length === 0) {
    prepHtml += '<li>No publications in preparation.</li>';
  } else {
    publications.inPreparation.forEach(pub => {
      prepHtml += `
        <li class="publication-item">
          <div class="publication-title">${pub.title || ''}</div>
          <div class="authors">${formatAuthors(pub.author)}</div>
          ${pub.note ? `<div class="publication-meta">${pub.note}</div>` : ''}
        </li>
      `;
    });
  }
  prepHtml += '</ul>';
  document.getElementById('prep').innerHTML = prepHtml;
  
  // Display submitted publications
  let submittedHtml = '<ul class="publications-list">';
  if (publications.submitted.length === 0) {
    submittedHtml += '<li>No submitted publications.</li>';
  } else {
    publications.submitted.forEach(pub => {
      submittedHtml += `
        <li class="publication-item">
          <div class="publication-title">${pub.title || ''}</div>
          <div class="authors">${formatAuthors(pub.author)}</div>
          ${pub.journal ? `<div class="publication-meta">Submitted to <i>${pub.journal}</i></div>` : ''}
          <div class="publication-links">
            ${pub.url ? `<a href="${pub.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Link</a>` : ''}
            ${pub.arxiv ? `<a href="${pub.arxiv}" target="_blank"><i class="fas fa-file-pdf"></i> arXiv</a>` : ''}
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
          </div>
        </li>
      `;
    });
  }
  submittedHtml += '</ul>';
  document.getElementById('submitted').innerHTML = submittedHtml;
  
  // Display published publications
  let publishedHtml = '<ul class="publications-list">';
  if (publications.published.length === 0) {
    publishedHtml += '<li>No published publications.</li>';
  } else {
    publications.published.forEach(pub => {
      // Format journal info with volume and number if available
      let journalInfo = '';
      if (pub.journal) {
        journalInfo += `<i>${pub.journal}</i>`;
        if (pub.volume) {
          journalInfo += ` ${pub.volume}`;
          if (pub.number) {
            journalInfo += `(${pub.number})`;
          }
        }
        if (pub.pages) {
          journalInfo += `, pp. ${pub.pages}`;
        }
        if (pub.year) {
          journalInfo += ` (${pub.year})`;
        }
      } else if (pub.booktitle) {
        journalInfo += `In <i>${pub.booktitle}</i>`;
        if (pub.year) {
          journalInfo += ` (${pub.year})`;
        }
      }
      
      publishedHtml += `
        <li class="publication-item">
          <div class="publication-title">${pub.title || ''}</div>
          <div class="authors">${formatAuthors(pub.author)}</div>
          ${journalInfo ? `<div class="publication-meta">${journalInfo}</div>` : ''}
          <div class="publication-links">
            ${pub.url ? `<a href="${pub.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Link</a>` : ''}
            ${pub.arxiv ? `<a href="${pub.arxiv}" target="_blank"><i class="fas fa-file-pdf"></i> arXiv</a>` : ''}
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
            ${pub.video ? `<a href="${pub.video}" target="_blank"><i class="fas fa-video"></i> Video</a>` : ''}
          </div>
        </li>
      `;
    });
  }
  publishedHtml += '</ul>';
  document.getElementById('published').innerHTML = publishedHtml;
}

// Load teaching data from text file
async function loadTeaching() {
  try {
    const response = await fetch('data/teaching.txt');
    if (!response.ok) {
      throw new Error('Failed to load teaching file');
    }
    
    const text = await response.text();
    const courses = parseTeachingFile(text);
    displayTeaching(courses);
  } catch (error) {
    console.error('Error loading teaching data:', error);
    document.querySelector('#teaching table tbody').innerHTML = 
      '<tr><td colspan="4">Error loading teaching data. Please check your teaching.txt file.</td></tr>';
  }
}

// Parse teaching data from text file
function parseTeachingFile(text) {
  // Split the text by course entries (assuming they're separated by blank lines)
  const entries = text.split(/\n\s*\n/);
  const courses = [];
  
  entries.forEach(entry => {
    if (!entry.trim()) return; // Skip empty entries
    
    const lines = entry.trim().split('\n');
    const course = {
      term: '',
      name: '',
      role: '',
      institution: ''
    };
    
    // Parse each line of the entry
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Term:')) {
        course.term = trimmedLine.substring('Term:'.length).trim();
      } else if (trimmedLine.startsWith('Course:')) {
        course.name = trimmedLine.substring('Course:'.length).trim();
      } else if (trimmedLine.startsWith('Role:')) {
        course.role = trimmedLine.substring('Role:'.length).trim();
      } else if (trimmedLine.startsWith('Institution:')) {
        course.institution = trimmedLine.substring('Institution:'.length).trim();
      }
    });
    
    // Add to courses array if it has required fields
    if (course.term && course.name) {
      courses.push(course);
    }
  });
  
  // Sort by term, assuming format like "Fall 2023" or "Spring 2022"
  courses.sort((a, b) => {
    const termA = a.term.split(' ');
    const termB = b.term.split(' ');
    
    // Compare years first
    const yearA = parseInt(termA[1]);
    const yearB = parseInt(termB[1]);
    
    if (yearB !== yearA) {
      return yearB - yearA; // Descending order by year
    }
    
    // Same year, compare semester
    const semesterOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3, 'Winter': 4 };
    return semesterOrder[termB[0]] - semesterOrder[termA[0]];
  });
  
  return courses;
}

// Display teaching data on the page
function displayTeaching(courses) {
  let tableHtml = '';
  
  courses.forEach(course => {
    tableHtml += `
      <tr>
        <td>${course.term}</td>
        <td>${course.name}</td>
        <td>${course.role || 'Primary Instructor'}</td>
        <td>${course.institution}</td>
      </tr>
    `;
  });
  
  document.querySelector('#teaching table tbody').innerHTML = tableHtml;
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tab functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Load publications and teaching data
  loadBibTeX();
  loadTeaching();
});
